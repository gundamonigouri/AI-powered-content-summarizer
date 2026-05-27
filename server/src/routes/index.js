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

export default router;
