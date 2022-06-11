module.exports = (error, req, res, next) => {
  // (1) Duplicate mongoose fields Error
  if (error.code == 11000) {
    res.status(500).send({
      name: "Duplicates",
      description: "Please, choose another unique value!",
    });
  }
  // (2) Cast Error

  // (3) Validation
  if (error.message.includes("validation failed")) {
    res.status(422).send({
      name: "Validation failed",
      description: "Please, follow our standards",
      error,
    });
  }
  res.send(error);
  //etc.... look at the project with jonas at github

  // to pass the error to the next middleware which will log it returnError middleware
  // + to complete the request life cycle and prevent it from hanging/stopping
  next(error);
};
