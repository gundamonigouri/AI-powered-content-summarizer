import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { AppError } from '../utils/apiResponse.js';
import { embedText } from './embedding.service.js';

let pineconeClient = null;
let index = null;

export const isPineconeConfigured = () => Boolean(config.pinecone.apiKey);

const isIndexNotFoundError = (error) => {
  const status = error?.response?.status || error?.status || error?.statusCode;
  const message = error?.message || '';
  return (
    error?.name === 'PineconeNotFoundError' ||
    status === 404 ||
    /index.*not.*found/i.test(message) ||
    /no.*index/i.test(message)
  );
};

export const getPineconeIndex = async () => {
  if (!isPineconeConfigured()) {
    throw new AppError('Pinecone API key is not configured', 500);
  }
  if (!index) {
    pineconeClient = new Pinecone({ apiKey: config.pinecone.apiKey });
    index = pineconeClient.index(config.pinecone.indexName);
  }
  return index;
};

export const storeSummaryRecord = async ({
  originalContent,
  summary,
  sourceType,
  sourceTitle,
  summaryType,
  length,
  metadata = {},
}) => {
  const id = uuidv4();
  const textToEmbed = `${sourceTitle || ''}\n${summary}\n${originalContent.slice(0, 2000)}`;
  const vector = await embedText(textToEmbed);

  const idx = await getPineconeIndex();
  const record = {
    id,
    values: vector,
    metadata: {
      sourceType,
      sourceTitle: sourceTitle || 'Untitled',
      summaryType,
      length,
      summary: summary.slice(0, 8000),
      originalPreview: originalContent.slice(0, 500),
      createdAt: new Date().toISOString(),
      ...metadata,
    },
  };

  await idx.namespace(config.pinecone.namespace).upsert([record]);

  return { id, ...record.metadata };
};

export const semanticSearch = async (query, topK = 10) => {
  if (!isPineconeConfigured()) {
    return [];
  }

  try {
    const queryVector = await embedText(query);
    const idx = await getPineconeIndex();

    const results = await idx.namespace(config.pinecone.namespace).query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    });

    return (results.matches || []).map((match) => ({
      id: match.id,
      score: match.score,
      ...match.metadata,
    }));
  } catch (error) {
    if (isIndexNotFoundError(error)) {
      return [];
    }
    throw error;
  }
};

export const listHistory = async (limit = 50) => {
  if (!isPineconeConfigured()) {
    return [];
  }

  try {
    const idx = await getPineconeIndex();
    const stats = await idx.describeIndexStats();
    const namespaceStats = stats.namespaces?.[config.pinecone.namespace];

    if (!namespaceStats?.recordCount) {
      return [];
    }

    const dummyVector = await embedText('summary history content');
    const results = await idx.namespace(config.pinecone.namespace).query({
      vector: dummyVector,
      topK: Math.min(limit, 100),
      includeMetadata: true,
    });

    const items = (results.matches || [])
      .map((match) => ({
        id: match.id,
        score: match.score,
        ...match.metadata,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return items;
  } catch (error) {
    if (isIndexNotFoundError(error)) {
      return [];
    }
    throw error;
  }
};

export const deleteRecord = async (id) => {
  if (!isPineconeConfigured()) {
    return;
  }

  try {
    const idx = await getPineconeIndex();
    await idx.namespace(config.pinecone.namespace).deleteOne(id);
  } catch (error) {
    if (isIndexNotFoundError(error)) {
      return;
    }
    throw error;
  }
};
