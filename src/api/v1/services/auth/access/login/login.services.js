const User = require("./../../../../models/user/User");

const {
  create_token,
} = require("./../../../../helpers/token");

const compare_hash = require("./../../../../helpers/compare_hash");

const sendEmail = require("./../../../../helpers/createSendEmail");

const giveAccess = require("./../../../../helpers/giveAccess");

const {
  login_POST_validation,
} = require("./../../../../validations/auth/access/login/login.validations");

//============================================================

const login_GET_service = ({ req, res, next }) => {
  res.json({
    message: "Welcome to the log in page....",
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
      name: "Invalid credentials",
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

    // (1) Create the account activation token
    const activationToken = await create_token(
      {
        id: user.id,
        secret: process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET,
        expiresIn: ACCOUNT_ACTIVATION_TOKEN_SECRET_EXPIRES_IN
      }
    );

    // (2) Assign the token to the user document
    user.account.activation.account_activation_token = activationToken;

    // (3) Save user document into the DB
    await user.save({ validateBeforeSave: false });

    // (4) Setup activation link
    const activationUrl = `${req.protocol}://${process.env.HOST}:${process.env.PORT}/api/v1/auth/activate-account/${activationToken}`;
    const message = `Click to activate your account, ${activationUrl}, you only have ${process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET_EXPIRES_IN}`;

    // (5) Send the activation link to user
    await sendEmail({
      email,
      subject: "Account activation link",
      message,
    });

    // (6)
    return res.status(200).json({
      status: "Success",
      message:
        "Welcome back!, Your account was deactivated. So, we sent you an account activation link to proceed!!",
    });
  }

  // (6) Check 2fa methods

  // (1) If TOTP is enabled
  const is_totp_enabled = user.account.two_fa.totp.is_enabled;

  if (is_totp_enabled) {
    return res.status(301).redirect("/api/v1/auth/totp/verify");
  }

  // (2) If OTP is enabled
  const is_otp_enabled = user.account.two_fa.otp.is_enabled;

  if (is_otp_enabled) {
    return res.status(301).redirect("/api/v1/auth/2fa/otp/verify");
  }

  // (3) If SMS is enabled
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  if (is_sms_enabled) {
    return res.status(301).redirect("/api/v1/auth/2fa/sms");
  }

  // (4) If Security Question is enabled
  const is_security_question_enabled = user.account.two_fa.question.is_enabled;

  if (is_security_question_enabled) {
    return res
      .status(301)
      .redirect("/api/v1/auth/2fa/security-question/verify");
  }

  // [Don't forget]: These steps (giveAccess function) should be done when there is no 2fa method enabled
  //  and after every successful identity verification 2fa method used.
  await giveAccess({ user, req, res });
};

module.exports = {
  login_GET_service,
  login_POST_service,
};
