import {
  injectable
} from '@loopback/core';
import {
  createLogger,
  format,
  transports
} from 'winston';
import 'winston-daily-rotate-file';

// Define the log format for the console and file.
// We'll use a combined format that includes a timestamp and the message.
const customFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`),
);

// Create the Winston logger instance.
const logger = createLogger({
  // The default log level. Messages with a lower severity will be ignored.
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  // Use a structured JSON format for file logs to make them easily parsable by log analysis tools.
  // We'll keep the console logs in a more human-readable format.
  format: format.json(),

  transports: [
    // Console transport: This will log messages to the console during development.
    new transports.Console({
      level: 'debug', // Show all debug messages in development
      format: format.combine(
        format.colorize(), // Add color for better readability
        customFormat // Use our custom readable format
      ),
    }),

    // File transport with daily rotation.
    // This is for production and will create log files in a 'logs' directory.
    new transports.DailyRotateFile({
      level: 'info', // Only log 'info' and higher messages to this file
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m', // Rotate files when they reach 20MB
      maxFiles: '14d', // Keep a maximum of 14 days of log files
    }),

    // An additional file transport specifically for errors.
    new transports.DailyRotateFile({
      level: 'error', // Only log 'error' messages to this file
      filename: 'logs/errors-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '30d',
    }),
  ],
});

/**
 * Winston Logging Service
 * Provides a simple API for logging within the LoopBack 4 application.
 */
@injectable({
  tags: {
    key: 'services.Logger'
  }
})
export class WinstonService {
  constructor() { }

  public info(message: string): void {
    logger.info(message);
  }

  public debug(message: string): void {
    logger.debug(message);
  }

  public warn(message: string): void {
    logger.warn(message);
  }

  public error(message: string): void {
    logger.error(message);
  }
}
