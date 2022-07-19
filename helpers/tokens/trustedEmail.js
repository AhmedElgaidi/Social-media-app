const jwt = require("jsonwebtoken");

// (1) Create email verification token
const create_trusted_email_verification_token = async (id) => {
  return await jwt.sign(
    { _id: id },
    process.env.TRUSTED_EMAIL_VERIFICATION_TOKEN_SECRET,
    {
      expiresIn: process.env.TRUSTED_EMAIL_VERIFICATION_TOKEN_SECRET_EXPIRES_IN,
    }
  );
};

// (2) Validate and verify email verification token;
// It validates it by the secret and it's expiration date (both)
const verify_trusted_email_verification_token = async (token) => {
  return await jwt.verify(
    token,
    process.env.TRUSTED_EMAIL_VERIFICATION_TOKEN_SECRET
  );
};

module.exports = {
  create_trusted_email_verification_token,
  verify_trusted_email_verification_token,
};
