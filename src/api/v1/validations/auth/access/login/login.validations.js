const login_POST_validation = ({ req, res, next }) => {
  // (1) Get user data  from request
  const { email, password } = req.body;

  // If email is not found
  if (!email) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find the email field in the request.",
    });
  }

  // If password is not found
  if (!password) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find the password field in the request.",
    });
  }

  return {
    email,
    password,
  };
};

module.exports = {
  login_POST_validation,
};
