const { create_token } = require("./token");

//===============================================

module.exports = async ({ user, req, res }) => {
  // (1) Create access and refresh token
  const access_token = await create_token({
    id: user.id,
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });

  const refresh_token = await create_token({
    id: user.id,
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  // (2) Get device info
  const device = req.device;

  //(3) Assign tokens and device info to the user document
  user.account.session.push({
    tokens: {
      access_token,
      refresh_token,
    },
    device,
  });

  // (4) Save user document
  await user.save({ validateBeforeSave: false });

  // (5) Inform user about status
  await res.status(200).json({
    status: "Success",
    message: "congrats, you now can access all our private resources!!",
    active_sessions: user.account.session.length,
    current_session_tokens: {
      access_token,
      refresh_token,
    },
  });
};
