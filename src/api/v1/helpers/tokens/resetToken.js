const jwt = require("jsonwebtoken");


// (1) Create password reset token
const create_password_reset_token_token = async (id) => {
  return await jwt.sign(
    {
      _id: id,
    },
    process.env.PASSWORD_RESET_TOKEN_SECRET,
    {
      expiresIn: process.env.PASSWORD_RESET_TOKEN_SECRET_EXPIRES_IN,
    }
  );
};

// (2) Verify password reset token
const verify_password_reset_token_token = async (token) => {
  return await jwt.verify(token, process.env.PASSWORD_RESET_TOKEN_SECRET);
};

module.exports = {
  create_password_reset_token_token,
  verify_password_reset_token_token,
};
