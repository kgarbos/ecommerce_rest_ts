import winston from 'winston';
import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import path from 'path';
import ErrorResponse from './utils/errorResponse';

dotenv.config({ path: './config.env' });

// Routes
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/products');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');

// Connect DB
import connectDB from './config/db';
connectDB();

// Create express app
const app = express();
app.use(express.json());

// Create winston logger instance
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs.log' }),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
});

// Use logger middleware to log requests and responses
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    logger.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`);
  });
  next();
});

// Mount routes
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);

app.get('/', (req, res) => {
  res.send('Api running');
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };

  error.message = err.message;

  if (err instanceof ErrorResponse) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }

  // Log error
  logger.error(`${error.message} ${error.stack}`);
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('unhandledRejection', (err, promise) => {
  logger.error(`Logged Error: ${err}`);
  server.close(() => process.exit(1));
});

export default server;