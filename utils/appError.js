class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); //this helps in excluding the constructor call from the stack trace... it is implemented bcause when we create a new error object, the stack trace includes the constructor call which is not useful for debugging
}
}
module.exports = AppError;
