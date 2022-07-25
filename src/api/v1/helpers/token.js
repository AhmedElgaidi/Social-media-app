const jwt = require("jsonwebtoken");

const create_token = async ({ id, secret, expiresIn }) => {
  return await jwt.sign(
    {
      _id: id,
    },
    secret,
    {
      expiresIn,
    }
  );
};

const verify_token = async ({ token, secret }) => {
  return await jwt.verify(token, secret);
};

module.exports = {
  create_token,
  verify_token,
};
