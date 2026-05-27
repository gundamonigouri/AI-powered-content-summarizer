import { config } from './index.js';

/**
 * Enable LangSmith tracing for all LangChain calls (Groq + OpenAI embeddings).
 * https://smith.langchain.com
 */
export const initLangSmith = () => {
  if (!config.langsmith.apiKey) {
    return false;
  }

  process.env.LANGCHAIN_TRACING_V2 = 'true';
  process.env.LANGCHAIN_ENDPOINT =
    config.langsmith.endpoint || 'https://api.smith.langchain.com';
  process.env.LANGCHAIN_API_KEY = config.langsmith.apiKey;
  process.env.LANGCHAIN_PROJECT = config.langsmith.project;

  if (config.langsmith.workspaceId) {
    process.env.LANGCHAIN_WORKSPACE_ID = config.langsmith.workspaceId;
  }

  return true;
};
