const jwt = require("jsonwebtoken");

// (1) Create refresh token
const create_refresh_token = async (id) => {
  return await jwt.sign({ _id: id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

// (2) Verify refresh token
const verify_refresh_token = async (token) => {
  return await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = {
  create_refresh_token,
  verify_refresh_token,
};
