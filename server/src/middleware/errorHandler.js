import { AppError } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Always log the error to stdout/stderr so platform logs (Vercel) capture details.
  // This helps debugging in production while still returning a safe message to clients.
  console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
