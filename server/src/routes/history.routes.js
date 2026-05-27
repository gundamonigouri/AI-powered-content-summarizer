import { Router } from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validate.js';
import {
  getHistoryHandler,
  deleteHistoryHandler,
} from '../controllers/history.controller.js';

const router = Router();

router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  getHistoryHandler
);

router.delete(
  '/:id',
  [param('id').notEmpty(), validate],
  deleteHistoryHandler
);

export default router;
