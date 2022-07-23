const User = require("./../../../../models/user/User");

//=====================================================================

// Get all account session
const sessions_GET_service = async ({ req, res, next }) => {
  const { access_token, userId } = req;

  const user = await User.findById(userId).select({
    "account.session": 1,
  });

  const accountCurrentSession = user.account.session.find(
    (el) => el.tokens.access_token === access_token
  );
  const accountOtherSession = user.account.session.filter(
    (el) => el.tokens.access_token !== access_token
  );

  res.status(200).json({
    status: "Success",
    sessions: {
      Current: accountCurrentSession,
      Other: {
        count: accountOtherSession.length,
        sessions: accountOtherSession,
      },
    },
  });
};

module.exports = {
  sessions_GET_service,
};
