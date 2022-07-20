// Our custom error object
class BaseError extends Error {
  constructor(name, description, statusCode, isOperational) {
    super(description); // means inherit the value of this property from parent "Error class"
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = BaseError;
