const logger = require("./logger");
const BaseError = require("./BaseError");
const otherErrorScenarios  = require('./otherErrorScenarios')

const logError = (error) => {
  error.description = error.message;
  logger.error({...error});
};

const logErrorMiddleware = (error, req, res, next) => {
  logError(error);
  next(error);
};

const isOperationalError = (error) => {
  if (error instanceof BaseError) {
    return error.isOperational;
  }
  return false;
};

const returnError = (error, req, res, next) => {
  logError(error);
  // This errors will reach client. So, you can make it specific
  if (isOperationalError(error)) {
    const name = error.name,
      description = error.message;
    res.status(error.statusCode).send({
      name,
      description,
    });
  } else {
    // Make the error generic
    res.status(500).json({
      name: "Server Error",
      description: "something went wrong",
    });
  }
  next();
};

module.exports = {
  logError,
  logErrorMiddleware,
  returnError,
  isOperationalError,
};
