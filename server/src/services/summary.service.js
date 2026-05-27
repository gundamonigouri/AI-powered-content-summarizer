import { generateSummary } from './groq.service.js';
import { storeSummaryRecord } from './pinecone.service.js';
import { scrapeUrl } from './scrape.service.js';
import { extractPdfText } from './pdf.service.js';
import { cleanText, truncateText } from '../utils/textCleaner.js';
import { estimateTokens, estimateSummaryTokens } from '../utils/tokenEstimator.js';
import { AppError } from '../utils/apiResponse.js';

const processAndSummarize = async ({
  content,
  sourceType,
  sourceTitle,
  summaryType,
  length,
  extraMetadata = {},
}) => {
  const cleaned = cleanText(truncateText(content));
  if (cleaned.length < 10) {
    throw new AppError('Content is too short to summarize', 400);
  }

  const inputTokens = estimateTokens(cleaned);
  const { summary, model, usage, langsmithTraced } = await generateSummary({
    content: cleaned,
    summaryType,
    length,
    sourceType,
  });

  const outputTokens =
    usage?.completion_tokens || estimateSummaryTokens(inputTokens, length);

  let stored = null;
  try {
    stored = await storeSummaryRecord({
      originalContent: cleaned,
      summary,
      sourceType,
      sourceTitle,
      summaryType,
      length,
      metadata: extraMetadata,
    });
  } catch (err) {
    console.warn('Pinecone storage failed:', err.message);
  }

  return {
    id: stored?.id || null,
    summary,
    sourceType,
    sourceTitle,
    summaryType,
    length,
    model,
    tokenUsage: {
      input: usage?.prompt_tokens || inputTokens,
      output: outputTokens,
      total: usage?.total_tokens || inputTokens + outputTokens,
      estimated: !usage?.total_tokens,
    },
    langsmithTraced: !!langsmithTraced,
    createdAt: stored?.createdAt || new Date().toISOString(),
  };
};

export const summarizeText = async (body) => {
  const { text, summaryType, length, title } = body;
  return processAndSummarize({
    content: text,
    sourceType: 'text',
    sourceTitle: title || 'Text Input',
    summaryType,
    length,
  });
};

export const summarizeUrl = async (body) => {
  const { url, summaryType, length } = body;
  const scraped = await scrapeUrl(url);
  return processAndSummarize({
    content: scraped.content,
    sourceType: 'url',
    sourceTitle: scraped.title,
    summaryType,
    length,
    extraMetadata: { url: scraped.url },
  });
};

export const summarizePdf = async (file, body) => {
  if (!file) throw new AppError('No PDF file uploaded', 400);
  const { summaryType, length } = body;
  const extracted = await extractPdfText(file.buffer, file.originalname);
  return processAndSummarize({
    content: extracted.content,
    sourceType: 'pdf',
    sourceTitle: extracted.title,
    summaryType,
    length,
    extraMetadata: { pages: extracted.pages, fileName: file.originalname },
  });
};
