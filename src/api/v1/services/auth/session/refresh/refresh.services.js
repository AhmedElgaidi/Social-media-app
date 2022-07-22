const User = require("./../../../../models/user/User");

const {
  verify_refresh_token,
  create_refresh_token,
} = require("./../../../../helpers/tokens/refreshToken");

const {
  create_access_token,
} = require("./../../../../helpers/tokens/accessToken");

//=================================================================

const refreshToken_POST_service = async ({ req, res, next }) => {
  // (1) Get refresh token
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
  // (3) verify refresh token
  const decodedRefreshToken = await verify_refresh_token(refresh_token).catch(
    // Errors in refresh token verification:
    (error) => {
      //  (1) if refresh token is manipulated
      if (error.toString().includes("invalid signature")) {
        return res.status(422).json({
          name: "Invalid Token",
          description: "Sorry, your refresh token is manipulated!!",
        });
      }

      // (2) if refresh token is expired
      return res.status(401).json({
        name: "Invalid Token",
        description:
          "Sorry, your refresh token is expired, you need to log in again with your credentials!!",
      });

      // (3)
      // TODO: If it's expired => delete the session data (both tokens) => log user out => now,
      // he needs to login from scratch with his credentials
    }
  );

  // (4) Create new access and refresh tokens
  const newAccessToken = await create_access_token(decodedRefreshToken._id);
  const newRefreshToken = await create_refresh_token(decodedRefreshToken._id);

  // (5) Get user document from decoded refresh token
  await User.findById(decodedRefreshToken._id).then(async (user) => {
    // (1) If user document is not found
    if (!user) {
      res.status(404).json({
        name: "Invalid Input",
        description:
          "Sorry, we couldn't find the associated account to this refresh token!!!",
      });
    }

    // (2) Check if received refresh token is among other user refresh tokens!!
    const updatedUser = user.account.session.find(
      (el) => el.tokens.refresh_token === refresh_token
    );

    //If it's not found!!
    if (!updatedUser) {
      res.status(401).json({
        name: "Invalid Token",
        description:
          "Sorry, we couldn't find the refresh token associated to this account!!!",
      });
    }

    // (3) Check if account is active or not
    const is_account_active = user.account.activation.is_account_active;

    // If it's deactivated
    if (!is_account_active) {
      return res.status(404).json({
        status: "Failed",
        message:
          "your account is deactivated. Please, check your account mail box to re-activate it so you can log in again!!",
      });
    }

    // If everything is okay??? then....
    // (6) Assign user document the new tokens and device info
    updatedUser.tokens.access_token = newAccessToken;
    updatedUser.tokens.refresh_token = newRefreshToken;
    updatedUser.device = req.device;

    // (7) Save user document and inform the front-end with the status
    await user.save({ validateBeforeSave: false }).then(() =>
      res.status(200).json({
        status: "Success",
        message: "You are assigned new access and refresh tokens",
        tokens: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
      })
    );
  });
};

module.exports = {
  refreshToken_POST_service,
};
