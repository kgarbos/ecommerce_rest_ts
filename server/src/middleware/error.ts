import ErrorResponse from '../utils/errorResponse';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

function isMongooseValidationError(err: any): err is mongoose.Error.ValidationError {
  return err instanceof mongoose.Error.ValidationError;
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };

  error.message = err.message;

  if (err.code == 11000) {
    const message = `Duplicate Field Value Entered`;
    error = new ErrorResponse(message, 400);
  }

  if (isMongooseValidationError(err)) {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    const message = messages.join(', ');
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error"
  });
}

module.exports = errorHandler;