import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

export function errorHandler(error, _req, res, _next) {
  let err = error;
  if (err?.name === 'ValidationError') {
    err = new AppError(400, 'Validation failed.', 'VALIDATION_ERROR', Object.values(error.errors || {}).map((item) => item.message));
  } else if (err?.code === 11000) {
    err = new AppError(409, 'A record with this value already exists.', 'DUPLICATE_RESOURCE');
  } else if (err instanceof mongoose.Error.CastError) {
    err = new AppError(400, 'Invalid identifier or query value.', 'INVALID_INPUT');
  } else if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    err = new AppError(401, 'Session is invalid or expired. Please sign in again.', 'AUTHENTICATION_REQUIRED');
  }

  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode >= 500 && process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : (err.message || 'Unexpected server error.'),
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
