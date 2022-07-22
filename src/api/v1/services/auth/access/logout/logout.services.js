const User = require("./../../../../models/user/User");

//===========================================================

const logout_DELETE_service = async ({ req, res, next }) => {
  // (1) Get access token and userId from protect middleware
  const access_token = req.access_token,
    userId = req.userId;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.session": 1,
  });

  // (3) Remove current session from user document
  user.account.session = user.account.session.filter(
    (el) => el.tokens.access_token !== access_token
  );

  // (4) save updated user document
  await user.save();

  // (5) Inform front-end with the status
  res.status(200).json({
    status: "Success",
    message: "You are logged out successfully!!",
  });
};

module.exports = {
  logout_DELETE_service,
};
