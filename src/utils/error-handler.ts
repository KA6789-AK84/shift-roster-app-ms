/**
 * Custom error class for expected application errors.
 * This allows us to differentiate between unexpected system errors
 * and errors that are part of the application's expected flow (e.g., validation errors, authentication failures).
 */
export class ExpectedError extends Error {
  statusCode: number;
  details?: any; // Optional field for additional error details

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    // Set the prototype explicitly to ensure `instanceof` works correctly
    Object.setPrototypeOf(this, ExpectedError.prototype);
  }
}

/**
 * A centralized error handling function for your application.
 * This can be expanded to log errors, send notifications, etc.
 * For now, it simply logs and re-throws ExpectedErrors, or wraps
 * other errors into a generic 500 status.
 *
 * @param error The error object.
 * @param logger An optional logger instance (e.g., WinstonService).
 * @returns An ExpectedError instance.
 */
export function handleError(error: unknown, logger?: any): ExpectedError {
  if (error instanceof ExpectedError) {
    logger?.error(`Expected Error (${error.statusCode}): ${error.message}`, error.details);
    return error;
  } else if (error instanceof Error) {
    logger?.error(`Unhandled System Error: ${error.message}`, error);
    return new ExpectedError(500, 'Internal Server Error', {
      originalMessage: error.message
    });
  } else {
    logger?.error(`Unknown Error Type: ${JSON.stringify(error)}`);
    return new ExpectedError(500, 'Internal Server Error', {
      originalError: error
    });
  }
}
