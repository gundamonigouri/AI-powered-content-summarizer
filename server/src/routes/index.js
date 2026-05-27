import { Router } from 'express';
import { config } from '../config/index.js';
import summarizeRoutes from './summarize.routes.js';
import historyRoutes from './history.routes.js';
import searchRoutes from './search.routes.js';

const router = Router();

router.use('/summarize', summarizeRoutes);
router.use('/history', historyRoutes);
router.use('/search', searchRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    langsmith: {
      tracing: config.langsmith.enabled,
      project: config.langsmith.project,
    },
  });
});

// Diagnostics route - returns presence (boolean) of key environment configuration
router.get('/_diag', (req, res) => {
  res.json({
    success: true,
    config: {
      groqConfigured: Boolean(process.env.GROQ_API_KEY),
      pineconeConfigured: Boolean(process.env.PINECONE_API_KEY),
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
      langchainConfigured: Boolean(process.env.LANGCHAIN_API_KEY),
      clientUrl: Boolean(process.env.CLIENT_URL),
      vercelUrl: Boolean(process.env.VERCEL_URL),
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  });
});

export default router;
