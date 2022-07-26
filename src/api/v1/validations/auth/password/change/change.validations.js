const changePassword_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { old_password, password, confirm_password } = req.body,
    userId = req.userId;

  // (2) check there existence

  // If old password is not found
  if (!old_password) {
    return res.status(404).json({
      name: "Not Found",
      description:
        "Sorry, we can't find the old password filed in the request.",
    });
  }

  // If  password is not found
  if (!password) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find the password filed in the request.",
    });
  }

  // If confirm password is not found
  if (!confirm_password) {
    return res.status(404).json({
      name: "Not Found",
      description:
        "Sorry, we can't find the confirm password filed in the request.",
    });
  }

  // (3) If new password doesn't match
  if (password !== confirm_password) {
    return res.status(422).json({
      name: "Invalid Input",
      description:
        "The new Password and confirm password fields have to match.",
    });
  }

  // (4) Pass them to the service function
  return {
    old_password,
    password,
    confirm_password,
    userId,
  };
};

module.exports = {
  changePassword_POST_validation,
};
