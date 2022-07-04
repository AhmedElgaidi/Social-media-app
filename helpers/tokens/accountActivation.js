const jwt = require("jsonwebtoken");

// (1) Create account activation token
const create_account_activation_token = async (email) => {
  return await jwt.sign(
    { email },
    process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET_EXPIRES_IN,
    }
  );
};

// (2) Validate and verify account activation token;
// It validates it by the secret and it's expiration date (both)
const verify_account_activation_token = async (token) => {
  return await jwt.verify(token, process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET);
};

module.exports = {
  create_account_activation_token,
  verify_account_activation_token,
};
