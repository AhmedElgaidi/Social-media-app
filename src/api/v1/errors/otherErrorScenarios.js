module.exports = (error, req, res, next) => {
  // (1) Duplicate mongoose fields Error
  if (error.code == 11000) {
    const value = Object.values(Object.values(Object.values(error))[3]);
    res.status(500).send({
      name: "Duplicated data",
      description: `Please, choose another unique value (${value})!`,
      error
    });
  }
  // (2) Cast Error
  if (error.name === "CastError") {
    res.status(422).send({
      name: "Invalid Input",
      description: `The given input can't be correct!!!`,
    });
  }

  // (3) Validation Error
  if (error.name === "ValidationError") {
    // Let's get only the message from our error object, i had to do it this way, so it
    // would work in the future for any level in the schema (not the 1st or 2nd level, etc...)
    const length = error.message.split(":").length;
    error = error.message.split(":")[length - 1].trim();
    res.status(422).send({
      name: "Invalid Input",
      description: error,
    });
  }

  // (4) Token expiration Error
  if (error.name === "TokenExpiredError" || error.message === "jwt expired") {
    res.status(401).send({
      name: "Invalid Token",
      description: `Sorry, your token is expired!!`,
    });
  }

  // (5) Invalid token Error
  if (error.name === "JsonWebTokenError" || error.message === "jwt malformed") {
    res.status(401).send({
      name: "Invalid Token",
      description: `Sorry, your token is invalid!!`,
    });
  }

  // to pass the error to the next middleware which will log it (returnError middleware)
  // + to complete the request life cycle and prevent it from hanging/stopping
  next(error);
};
