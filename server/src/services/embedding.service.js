import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from '../config/index.js';
import { initLangSmith } from '../config/langsmith.js';
import { AppError } from '../utils/apiResponse.js';

initLangSmith();

let embeddingsInstance = null;

export const getEmbeddings = () => {
  if (!config.openai.apiKey) {
    throw new AppError('OpenAI API key required for embeddings. Set OPENAI_API_KEY in .env', 500);
  }
  if (!embeddingsInstance) {
    embeddingsInstance = new OpenAIEmbeddings({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.embeddingModel,
    });
  }
  return embeddingsInstance;
};

export const embedText = async (text, metadata = {}) => {
  const embeddings = getEmbeddings();
  const vector = await embeddings.embedQuery(text, {
    runName: 'embed-text',
    tags: ['embedding', 'pinecone'],
    metadata: { textLength: text.length, ...metadata },
  });
  return vector;
};

export const embedDocuments = async (texts) => {
  const embeddings = getEmbeddings();
  return embeddings.embedDocuments(texts, {
    runName: 'embed-documents',
    tags: ['embedding', 'batch'],
  });
};
