const verify_POST_validation = ({ req, res, next }) => {
  // (1) Get token from request
  const token = req.params.token;
console.log(token)
  // If not found
  if (!token) {
    return res.status(404).json({
      name: "Not Found",
      description:
        "Sorry, we can't find the verification token in the request parameters.",
    });
  }

  // (2) Pass token the service function
  return token;
};

module.exports = {
  verify_POST_validation,
};
