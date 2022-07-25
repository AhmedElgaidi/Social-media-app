const { TokenExpiredError } = require("jsonwebtoken");

const disableTrustedEmail_DELETE_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { token } = req.params;

  // (2) If token is not found
  if (!token) {
    return res.status(404).json({
      name: "Token Not Found",
      description:
        "Sorry, we can't find the verification token in the request.",
    });
  }

  // (3) Pass data to the service function
  return {
    token,
  };
};

const sendEmail_during_recovery_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { email } = req.body;

  // (2) If not found
  if (!email) {
    return res.status(404).json({
      name: "Email Not Found",
      description: "Sorry, we can't find the email in the request.",
    });
  }

  // (3) Pass data to the service function
  return {
    email,
  };
};

const verify_during_recovery_GET_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { token } = req.body;

  // (2) If not found
  if (!token) {
    return res.status(404).json({
      name: "Token Not Found",
      description: "Sorry, we can't find the token in the request parameters.",
    });
  }

  // (3) Pass token to the service function
  return {
    token,
  };
};

module.exports = {
  disableTrustedEmail_DELETE_validation,
  sendEmail_during_recovery_POST_validation,
  verify_during_recovery_GET_validation,
};
