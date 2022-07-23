const User = require("./../../.././../models/user/User");

const speakeasy = require("speakeasy");

const {
  scanTOTP_qrCode_GET_validation,
  verifyTOTP_during_setup_POST_validation,
  verifyTOTP_during_login_POST_validation
} = require("./../../../../validations/auth/security_layers/totp/totp.validations");

const {
  verifySMS_duringLogin_GET_controller,
} = require("../../../../controllers/auth/security_layers/sms/sms.controllers");

//========================================================================
const all2faMethods_GET_service = async ({ req, res, next }) => {
  // (1) Get user from DB
  const user = await User.findById(req.userId).select({ "account.two_fa": 1 });

  // (2) Inform the frontend with the status
  res.status(200).json({
    "2fa methods": {
      TOTP: user.account.two_fa.totp.is_enabled,
      OTP: user.account.two_fa.otp.is_enabled,
      "code over SMS": user.account.two_fa.sms.is_enabled,
      "security question": user.account.two_fa.question.is_enabled,
    },
  });
};

// method (1): TOTP (Time-based One-Time Password)
// we need to do this during setup and do the verifying part again when we need that.

// (1) Generate TOTP
const generateSecretTOTP_POST_service = async ({ req, res, next }) => {
  // (1) Generate the temp_secret
  const temp_secret = speakeasy.generateSecret();

  // (2) Get user document
  const user = await User.findById(req.userId).select({
    "account.two_fa.totp": 1,
  });

  // (3) Check if the user already has a secret/ already enabled this feature
  if (user.account.two_fa.totp.secret) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "you already enabled this feature!!!",
    });
  }

  // (4) Check if user already has a temp_secret
  const is_temp_secret_found = user.account.two_fa.totp.temp_secret;

  if (is_temp_secret_found) {
    return res
      .status(301)
      .redirect("/api/v1/auth/2fa/totp/scan/" + is_temp_secret_found);
  }

  // (5) Assign the temp_secret to the user object
  user.account.two_fa.totp.temp_secret = temp_secret.base32;

  // (6) Save user document
  await user.save();

  // (7) send the secret to the front-end to generate a qrcode based on it. So the user can scan it and give us
  // the 6 digits resulted from any authenticating app such as: Google authenticator
  // [NOTE]: This would be the first and last time to share the secret (It should be saved on the DB)!!!!
  res.status(301).redirect("/api/v1/auth/2fa/totp/scan/" + temp_secret.base32);
};

// (2) Scan Secret
const scanTOTP_qrCode_GET_service = async ({ req, res, next }) => {
  // (1) Get qrcode from request
  const { qrcode } = scanTOTP_qrCode_GET_validation({ req, res, next });

  // (2) Send qrcode to frontend to generate for user a qrcode to be scanned
  res.status(200).json({
    url: req.url,
    "QR code": qrcode,
    description:
      "The front end should use this secret and create a qrcode for user to scan!!!",
  });
};

// (3) Verify TOTP during setup
const VerifyTOTP_during_setup_GET_service = async ({ req, res, next }) => {
  res
    .status(200)
    .send(
      "The page where you enter the code generated from you authenticator app."
    );
};

const verifyTOTP_during_setup_POST_service = async ({ req, res, next }) => {
  // (1) Get TOTP token
  const { token } = verifyTOTP_during_setup_POST_validation({ req, res, next });

  // (2) Get user document from DB
  const user = await User.findById(req.userId).select({
    "account.two_fa.totp": 1,
  });

  // (3) Check if user is coming to verify. but, he didn't generate the secret!!
  if (
    !user.account.two_fa.totp.is_enabled &&
    user.account.two_fa.totp.temp_secret === undefined
  ) {
    return res.status(400).json({
      name: "Bad request",
      description:
        "You need to do 2 steps (Generate and scan a qrcode) before verifying it!!!",
    });
  }

  // (4) Check if the user already has a secret (This means this feature is already enabled!!)
  if (user.account.two_fa.totp.is_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description: "You already enabled this feature!!!",
    });
  }

  // (5) Check the given token against the previously assigned temp_secret
  const isVerified = speakeasy.totp.verify({
    secret: user.account.two_fa.totp.temp_secret,
    encoding: "base32",
    token,
  });

  // If verification failed
  if (!isVerified) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Sorry, your given totp token is not valid.",
    });
  }

  // If everything is okay until now? Then,
  // (6) Update user document

  // (1) Save the temp_secret permanently
  user.account.two_fa.totp.secret = user.account.two_fa.totp.temp_secret;
  // (2) Delete the temp_secret field
  user.account.two_fa.totp.temp_secret = undefined;
  // (3) make the totp is enabled
  user.account.two_fa.totp.is_enabled = true;

  // (7) Save user document
  await user.save();

  // (8) Inform the frontend with the status
  res.status(200).json({
    status: "Success",
    description: "Congrats, you successfully enabled 2FA feature (TOTP).",
  });
};

// (4) Disable TOTP
const disableTOTP_DELETE_service = async ({ req, res, next }) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get user document from DB
  const user = await User.findById(userId).select({
    "account.two_fa.totp": 1,
  });

  // (3) Check if this feature is already disabled
  const is_TOTP_enabled = user.account.two_fa.totp.is_enabled;

  if (!is_TOTP_enabled) {
    return res.status(400).json({
      name: "Bad request",
      description: "This feature (TOTP) is already disabled!!!",
    });
  }

  // (4) Update the user document
  user.account.two_fa.totp.is_enabled = false;
  user.account.two_fa.totp.temp_secret = undefined;
  user.account.two_fa.totp.secret = undefined;

  // (5) Save user document
  await user.save();

  // (6) Inform the frontend with the status
  res.status(200).json({
    status: "Success",
    description:
      "You disabled the TOTP feature (keep in mind that you are less secure now!!)",
  });
};

// (5) Verify during login process
const verifyTOTP_during_login_GET_service = async ({ req, res, next }) => {
  return res.status(200).json({
    url: req.url,
    "2FA method": "TOTP",
    message:
      "This is the page where the user should enter his code generated from his authenticator app in order to log in!!\n During login attempt!!",
  });
};

const verifyTOTP_during_login_POST_service = async ({ req, res, next }) => {
  // (1) Get TOTP token
  const { userId, token } = verifyTOTP_during_login_POST_validation({
    req,
    res,
    next,
  });

  // If token is not found
  if (!token) {
    return res.status(404).json({
      name: "Not Found",
      description:
        "Please, send your token generated from your authenticator app!!",
    });
  }

  // If userId is not found
  if (!userId) {
    return res.status(404).json({
      name: "Not Found",
      description: "Please, send your ID!!",
    });
  }

  // (2) Get user document from DB
  const user = await User.findById(userId).select({
    "account.two_fa.totp": 1,
    "account.session": 1,
  });

  // If user is not found
  if (!user) {
    return res.status(404).json({
      name: "User Not Found",
      description:
        "Sorry, we can't find the user associated to the given token.",
    });
  }

  // (3) Check the given token against the stored secret
  const isVerified = speakeasy.totp.verify({
    secret: user.account.two_fa.totp.secret,
    encoding: "base32",
    token,
  });

  // If verification failed
  if (!isVerified) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Sorry, your given totp token is not valid.",
    });
  }

  // (4) If there are any other security layers enabled (only remains OTP, SMS and the security question)
  // Method (2) OTP
  const is_otp_enabled = user.account.two_fa.otp.is_enabled;

  if (is_otp_enabled) {
    return res.status(301).redirect("/api/v1/auth/2fa/otp/verify");
  }

  // Method (3) Code over SMS
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  if (is_sms_enabled) {
    return res.status(301).redirect("/api/v1/auth/2fa/sms");
  }

  // Method (4) Security Question
  const is_security_question_enabled = user.account.two_fa.question.is_enabled;

  if (is_security_question_enabled) {
    return res
      .status(301)
      .redirect("/api/v1/auth/2fa/security-question/verify");
  }

  // (5) Give access
  await giveAccess({ user, req, res });
};

//========================================================================

module.exports = {
  all2faMethods_GET_service,
  generateSecretTOTP_POST_service,
  disableTOTP_DELETE_service,
  scanTOTP_qrCode_GET_service,
  VerifyTOTP_during_setup_GET_service,
  verifyTOTP_during_setup_POST_service,
  verifyTOTP_during_login_GET_service,
  verifyTOTP_during_login_POST_service,
};
