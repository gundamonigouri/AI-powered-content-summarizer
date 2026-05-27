import { successResponse } from '../utils/apiResponse.js';
import {
  summarizeText,
  summarizeUrl,
  summarizePdf,
} from '../services/summary.service.js';

export const summarizeTextHandler = async (req, res, next) => {
  try {
    const result = await summarizeText(req.body);
    return successResponse(res, result, 'Text summarized successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const summarizeUrlHandler = async (req, res, next) => {
  try {
    const result = await summarizeUrl(req.body);
    return successResponse(res, result, 'URL summarized successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const summarizeFileHandler = async (req, res, next) => {
  try {
    const result = await summarizePdf(req.file, req.body);
    return successResponse(res, result, 'PDF summarized successfully', 201);
  } catch (error) {
    next(error);
  }
};
