import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { uploadPdf, handleMulterError } from '../middleware/upload.js';
import {
  summarizeTextHandler,
  summarizeUrlHandler,
  summarizeFileHandler,
} from '../controllers/summarize.controller.js';

const router = Router();

const summaryTypes = ['short', 'detailed', 'bullets', 'insights'];
const lengths = ['short', 'medium', 'long'];

const commonValidators = [
  body('summaryType')
    .optional()
    .isIn(summaryTypes)
    .withMessage(`summaryType must be one of: ${summaryTypes.join(', ')}`),
  body('length')
    .optional()
    .isIn(lengths)
    .withMessage(`length must be one of: ${lengths.join(', ')}`),
];

router.post(
  '/text',
  [
    body('text').trim().notEmpty().withMessage('text is required'),
    body('text').isLength({ max: 100000 }).withMessage('text exceeds maximum length'),
    body('title').optional().trim().isLength({ max: 200 }),
    ...commonValidators,
    validate,
  ],
  summarizeTextHandler
);

router.post(
  '/url',
  [
    body('url').trim().notEmpty().isURL().withMessage('Valid url is required'),
    ...commonValidators,
    validate,
  ],
  summarizeUrlHandler
);

router.post(
  '/file',
  (req, res, next) => {
    uploadPdf(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  [...commonValidators, validate],
  summarizeFileHandler
);

export default router;
