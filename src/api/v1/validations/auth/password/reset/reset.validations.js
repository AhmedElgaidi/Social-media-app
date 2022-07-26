const resetPassword_POST_validation = ({ req, res, next }) => {
  // (1) Get new passwords and password reset token from request
  const { token } = req.params,
    { password, confirm_password } = req.body;

  // (2) Check for user data existence

  // If token is not found
  if (!token) {
    return res.status(404).json({
      status: "Not Found",
      description: "Sorry, we can't fiend the token in the request parameters.",
    });
  }

  // If password are not found
  if (!password) {
    return res.status(404).json({
      status: "Not Found",
      description: "Sorry, we can't find the password field in the request.",
    });
  }

  // If password and confirm_password are not found
  if (!confirm_password) {
    return res.status(404).json({
      status: "Not Found",
      description:
        "Sorry, we can't find the confirm password field in the request.",
    });
  }

  // (3) Check if password match or not
  if (password !== confirm_password) {
    return res.status(422).json({
      name: "Invalid Input",
      description:
        "The password and the confirm password fields have to be matched.",
    });
  }

  // (4) Pass user data to the service function
  return {
    token,
    password,
    confirm_password,
  };
};

module.exports = {
  resetPassword_POST_validation,
};
