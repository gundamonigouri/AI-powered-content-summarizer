import { successResponse } from '../utils/apiResponse.js';
import { semanticSearch } from '../services/pinecone.service.js';

export const searchHandler = async (req, res, next) => {
  try {
    const { query, topK } = req.body;
    const results = await semanticSearch(query, topK || 10);
    return successResponse(res, { results, count: results.length }, 'Search completed');
  } catch (error) {
    next(error);
  }
};
