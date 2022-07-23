const refreshToken_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const refresh_token =
    req.headers["x-refresh-token"] ||
    req.body.refresh_token ||
    req.query.refresh_token;

  // (2) Check for its existence in the received request
  if (!refresh_token) {
    return res.status(404).json({
      name: "Invalid Input",
      description: "Your refresh token is not found!!",
    });
  }

  // (3) Pass refresh token to the service function
  return {
    refresh_token,
  };
};

module.exports = {
  refreshToken_POST_validation,
};
