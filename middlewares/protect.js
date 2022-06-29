const { verify_access_token } = require("../helpers/tokens/accessToken");

const protect = async (req, res, next) => {
  // (1) Get access token
  const access_token = req.headers['x-access-token'] || req.body.access_token;

  // (2) Check for its existence
  if (!access_token) {
    res.status(404).json({
      name: "Invalid Input",
      description: "Your access token is not found!!",
    });
  }
  // (3) verify (validate/ check expiration) access token
  await verify_access_token(access_token).catch((error) => {
    // (1) if user manipulated the token
    if (error.toString().includes("invalid signature")) {
      return res.status(422).json({
        name: "Invalid Token",
        description: "Your access token is manipulated!!",
      });
    }
    // (2) if access token is expired
    res.status(401).json({
      name: "Invalid Token",
      description: "Your access token is expired, use your refresh token to get new access token!!",
    });
  });

  next();
};

module.exports = protect;
