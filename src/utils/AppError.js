export default class AppError extends Error {
  constructor(statusCode, message, code = 'REQUEST_FAILED', details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}
