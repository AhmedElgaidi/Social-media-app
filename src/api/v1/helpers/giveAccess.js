const { create_access_token } = require("./tokens/accessToken");
const { create_refresh_token } = require("./tokens/refreshToken");

//===============================================
module.exports = async ({ user, req, res }) => {
  // (1) Create access and refresh token
  const access_token = await create_access_token(user.id);
  const refresh_token = await create_refresh_token(user.id);

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
    "tokens number": user.account.session.length,
    tokens: user.account.session,
  });
};
