import { successResponse } from '../utils/apiResponse.js';
import {
  deleteRecord,
  isPineconeConfigured,
  listHistory,
} from '../services/pinecone.service.js';

export const getHistoryHandler = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const items = await listHistory(limit);
    return successResponse(
      res,
      {
        items,
        count: items.length,
        storageEnabled: isPineconeConfigured(),
      },
      'History retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryHandler = async (req, res, next) => {
  try {
    await deleteRecord(req.params.id);
    return successResponse(res, null, 'Record deleted');
  } catch (error) {
    next(error);
  }
};
