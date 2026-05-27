import dotenv from 'dotenv';

dotenv.config();

// Only Groq API key is strictly required for core summarization functionality.
const required = ['GROQ_API_KEY'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  const message = `Missing required environment variables: ${missing.join(', ')}. Copy server/.env.example to server/.env and set real values before starting the app.`;
  if (process.env.NODE_ENV === 'production') {
    console.error(message);
    process.exit(1);
  }
  console.warn(message);
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME || 'content-summarizer',
    namespace: process.env.PINECONE_NAMESPACE || 'summaries',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  upload: {
    maxFileSizeMb: 10,
    allowedMimeTypes: ['application/pdf'],
  },
  langsmith: {
    enabled: !!process.env.LANGCHAIN_API_KEY,
    apiKey: process.env.LANGCHAIN_API_KEY,
    project: process.env.LANGCHAIN_PROJECT || 'content-summarizer',
    endpoint: process.env.LANGCHAIN_ENDPOINT,
    workspaceId: process.env.LANGCHAIN_WORKSPACE_ID,
  },
  vercel: {
    url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  },
};
