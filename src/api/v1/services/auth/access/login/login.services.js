const User = require("./../../../../models/user/User");

const { create_token } = require("./../../../../helpers/token");

const compare_hash = require("./../../../../helpers/compare_hash");

const activate_account = require("./../../../../helpers/activate_account");

const check_2fa_methods = require("./../../../../helpers/check_2fa_methods");

const sendEmail = require("./../../../../helpers/createSendEmail");

const giveAccess = require("./../../../../helpers/giveAccess");

const {
  login_POST_validation,
} = require("./../../../../validations/auth/access/login/login.validations");

//============================================================

const login_GET_service = ({ req, res, next }) => {
  res.json({
    message:
      "Welcome to the log in page. \n Please write your previously assigned email and password to log in.",
  });
};

const login_POST_service = async ({ req, res, next }) => {
  // (1) Get user data from request
  const { email, password } = login_POST_validation({ req, res, next });

  // (2) check for user email in our DB
  const user = await User.findOne({
    "account.email.value": email,
  });

  // User is not found
  if (!user) {
    res.status(404).json({
      name: "Invalid Credentials",
      description: "Please, provide us with your own correct credentials!!",
    });
  }

  // (3) Check for password match
  const isCorrectPassword = await compare_hash(
    password,
    user.account.password.value
  );

  // If password is not correct
  if (!isCorrectPassword) {
    res.status(401).json({
      name: "Not Authenticated",
      description: "Please, provide us with your own correct credentials!!",
    });
  }

  // (4) Check if he is verified or not
  const is_account_verified = await user.account.email.is_verified;

  // If his account is not verified
  if (!is_account_verified) {
    return res.status(422).json({
      name: "Invalid account status",
      description:
        "Your account is not verified yet!. Please, check your mail box",
    });
  }

  // (5) Check if account is active or not
  const is_account_active = user.account.activation.is_account_active;

  // If user deactivated his account
  if (!is_account_active) {
    // send him email. So, he can activate his account again!!
    await activate_account({ req, res, user, email });
  }

  // (6) Check 2fa methods
  await check_2fa_methods({ res, user });

  // [Don't forget]: These steps (giveAccess function) should be done when there is no 2fa method enabled
  //  and after every successful identity verification 2fa method used.
  await giveAccess({ user, req, res });
};

module.exports = {
  login_GET_service,
  login_POST_service,
};
