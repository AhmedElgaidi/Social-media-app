const activateAccount_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const token = req.params.token;

  // (2) Check for it's existence
  if (!token) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find the token in the request.",
    });
  }

  // (3) Pass the token the service function
  return { token };
};

module.exports = {
  activateAccount_POST_validation,
};
