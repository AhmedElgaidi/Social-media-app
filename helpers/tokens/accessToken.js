const jwt = require("jsonwebtoken");


// (1) Create access token
const create_access_token = async (id) => {
  return await jwt.sign(
    {
      _id: id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

// (2) Verify access token
const verify_access_token = async (token) => {
  return await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

module.exports = {
  create_access_token,
  verify_access_token,
};
