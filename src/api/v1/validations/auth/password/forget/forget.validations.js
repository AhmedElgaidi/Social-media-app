const forgetPassword_GET_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { email } = req.body;

  // (2) If email is not found
  if (!email) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find the email field in the request.",
    });
  }

  // (3) Pass user data to the service function
  return {
    email,
  };
};

module.exports = {
  forgetPassword_GET_validation,
};
