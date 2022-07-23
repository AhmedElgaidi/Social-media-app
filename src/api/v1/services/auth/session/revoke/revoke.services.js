const User = require("./../../../../models/user/User");

//=========================================================================

// Delete a user session
const revokeSession_DELETE_service = async ({ req, res, next }) => {
  // (1) Get access token and userId from protect middleware
  const { access_token, userId } = req;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.session": 1,
  });

  // (3) Remove current session from user document
  user.account.session = user.account.session.filter(
    (el) => el.tokens.access_token !== access_token
  );

  // (4) save updated user document and inform front-end with the status
  await user.save().then((user) => {
    res.status(200).json({
      status: "Success",
      message: "Congrats, your desired session is deleted successfully!!",
      remained_session: {
        count: user.account.session.length,
        sessions: user.account.session,
      },
    });
  });
};

module.exports = {
  revokeSession_DELETE_service,
};
