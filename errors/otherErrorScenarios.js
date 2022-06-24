module.exports = (error, req, res, next) => {
  // (1) Duplicate mongoose fields Error
  if (error.code == 11000) {
    res.status(500).send({
      name: "Duplicated data",
      description: "Please, choose another unique value!",
    });
  }
  // (2) Cast Error

  // (3) Validation Error
  if (error.message.includes("validation failed")) {
    // Let's get only the message from our error object, i had to do it this way, so it
    // would work in the future for any level in the schema (not the 1st or 2nd level, etc...)
    const length = error.message.split(":").length;
    error = error.message.split(":")[length - 1].trim();
    res.status(422).send({
      name: "Invalid Input",
      description: error,
    });
  }
  //etc.... look at the project with jonas at github

  // to pass the error to the next middleware which will log it (returnError middleware)
  // + to complete the request life cycle and prevent it from hanging/stopping
  next(error);
};
