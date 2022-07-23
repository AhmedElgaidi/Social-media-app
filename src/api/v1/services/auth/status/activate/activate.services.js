const User = require("./../../../../models/user/User");

const {
  verify_account_activation_token,
} = require("./../../../../helpers/tokens/accountActivation");

const {
  activateAccount_POST_validation,
} = require("./../../../../validations/auth/status/activate/activate.validations");

//=========================================================================

const activateAccount_POST_service = async ({ req, res, next }) => {
  // (1) Get account activation token from request
  const token = activateAccount_POST_validation({ req, res, next });

  // (2) Validate token and check it's expiration date
  await verify_account_activation_token(token).catch((error) => {
    // (1) if user manipulated the token
    if (error.toString().includes("invalid signature")) {
      return res.status(422).json({
        name: "Invalid Token",
        description: "Sorry, your access token is manipulated!!",
      });
    }

    // (2) if access token is expired
    res.status(401).json({
      name: "Invalid Token",
      description:
        "Sorry, your access token is expired. Use your refresh token to get new tokens!!",
    });
  });

  // (3) If everything is okay, then check it in the DB
  const user = await User.findOne({
    "account.activation.account_activation_token": token,
  }).select({
    "account.activation": 1,
  });

  // If user not found
  if (!user) {
    return res.status(404).json({
      name: "Invalid Credentials",
      description: "Please, provide us with your own correct credentials!!",
    });
  }

  // (4) If account is already activated
  const is_account_active = user.account.activation.is_account_active;
  if (is_account_active) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Your account is already activated!!",
    });
  }

  // (5) Update user document (make it active)
  user.account.activation.is_account_active = true;

  // (6) Save user document
  await user.save();

  // (7) Inform front-end about the status
  res.status(200).json({
    status: "Success",
    message:
      "Your account is activated successfully. Now you can login and play around!!!",
  });
};

module.exports = { activateAccount_POST_service };
