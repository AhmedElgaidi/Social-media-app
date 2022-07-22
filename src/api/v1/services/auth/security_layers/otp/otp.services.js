const User = require("./../../../../models/user/User");

const sendEmail = require("./../../../../helpers/createSendEmail");

const is_otp_match = require("./../../../../helpers/is_otp_match");

//=======================================================================

// method (2): Email him OTP code  (One-Time Password)

// (1) Enable
const generateSendOTP_GET_service = ({ req, res, next }) => {
  res
    .status(200)
    .send(
      "A page with a button to click to generate an OTP code and be sent to you."
    );
};

const generateSendOTP_POST_service = async ({ req, res, next }) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get user document from DB
  const user = await User.findById(userId).select({
    "account.two_fa.otp": 1,
    "account.email": 1,
  });

  // Check if this feature is already enabled
  if (user.account.two_fa.otp.is_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description: "This 2FA method (OTP) is already enabled!",
    });
  }

  // Check if he already has a valid otp code in his mail box
  if (
    user.account.two_fa.otp.value &&
    user.account.two_fa.otp.expires_at > Date.now()
  ) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "Please, check your mailbox. The OTP code sent to your mailbox is still valid!",
    });
  }

  // (3) Generate otp (random 6 digits)
  const otp = Math.floor(100000 + Math.random() * 900000);

  // (4) Assign the otp code to user document
  user.account.two_fa.otp.value = otp;

  // (5) Save updated user document
  await user.save({ validateBeforeSave: false });

  // (6) Setup and send email with OTP code
  await sendEmail({
    email: user.account.email.value,
    subject: "OTP Code",
    message: `Hello, there.\nThis is your "${otp}" otp code, you have to provide it to verify your login attempt (Only valid for 15 min).`,
  });

  // (7) Redirect him to a page to verify this received otp code
  res.status(301).redirect("/api/v1/auth/2fa/otp/verify");
};

// (2) Verify
const verifyOTP_GET_service = ({ req, res, next }) => {
  res.status(200).json({
    url: req.url,
    "2FA method": "OTP",
    message: "Please, send us the otp code sent to your mailbox!",
  });
};

const verifyOTP_POST_service = async ({ req, res, next }) => {
  // (1) Get userId and otp from request
  const { userId, otp } = req.body;

  // If ID is not found
  if (!userId) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find the user ID.",
    });
  }

  // IF otp is not found
  if (!otp) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find the otp.",
    });
  }

  // If otp length isn't correct, we don't have to check it in our db, right!
  if (otp.toString().length != 6) {
    res.status(422).json({
      name: "Invalid Input",
      description: "This otp length can't be correct!",
    });
  }

  // (2) Check user by it's ID in our DB
  const user = await User.findById(userId).select({
    "account.two_fa.otp": 1,
    "account.session": 1,
  });

  // If user not found
  if (!user) {
    res.status(422).json({
      status: "Invalid Input",
      description: "We could find any user with this given ID.",
    });
  }

  // (3) Check if user has this token
  const otp_found = user.account.two_fa.otp.value;

  // If otp is not found in DB
  if (!otp_found) {
    res.status(404).json({
      name: "Not Found",
      description: "We could't find any otp code assigned to this user.",
    });
  }

  // (4) Check if otp against saved otp in our DB
  const is_match = await is_otp_match(otp, otp_found);

  // NO match?
  if (!is_match) {
    res.status(422).json({
      name: "Invalid Input",
      description: "This given otp didn't match with our sent otp.",
    });
  }

  // (5) Check if it's expired
  const is_otp_expired = user.account.two_fa.otp.expires_at < Date.now();

  // IF it's expired
  if (is_otp_expired) {
    // (1) Delete otp from user document
    user.account.two_fa.otp.value = undefined;
    user.account.two_fa.otp.expires_at = undefined;
    user.account.two_fa.otp.created_at = undefined;

    // (2) Save it in DB
    await user.save();
    return res.status(422).json({
      name: "Invalid Input",
      description:
        "This otp is already expired, click the resend button to send you a new valid one!",
    });
  }

  // If everything is okay. Then,
  // (6) Delete the otp from user document, so he/she can't use it again even it's valid (one time use!)
  user.account.two_fa.otp.value = undefined;
  user.account.two_fa.otp.expires_at = undefined;
  user.account.two_fa.otp.created_at = undefined;
  user.account.two_fa.otp.is_enabled = true; // mark this feature as enabled

  // (7) If there are any other security layers enabled (only remains sms and the security question)
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

  // (8) Give him/her access
  await giveAccess({ user, req, res });
};

// (3) Disable
const disableOTP_DELETE_service = async ({ req, res, next }) => {
  // (1) Get userId from protect middleware
  const userId = req.userId;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.two_fa.otp": 1,
  });

  // If it's already disabled
  if (!user.account.two_fa.otp.is_enabled) {
    // (1) Update user document (delete created fields, in case he doesn't want to proceed)
    user.account.two_fa.otp.value = undefined;
    user.account.two_fa.otp.created_at = undefined;
    user.account.two_fa.otp.expires_at = undefined;

    // (2) Save user document
    await user.save();

    // (3) Inform frontend with the status
    return res.status(400).json({
      status: "Bad Request",
      description: "This 2FA feature (OTP) is already disabled.",
    });
  }

  // (3) Update user document (disable otp)
  user.account.two_fa.otp.is_enabled = false;
  user.account.two_fa.otp.value = undefined;
  user.account.two_fa.otp.created_at = undefined;
  user.account.two_fa.otp.expires_at = undefined;

  // (4) Save user document
  await user.save();

  // (5) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "You disabled a 2fa method (OTP) successfully (Keep in mind, you are less secure now!!).",
    user,
  });
};

// (4) Resend OTP
const re_generate_send_OTP_POST_service = async ({ req, res, next }) => {
  // (1) Get userId from request
  const { userId } = req.body;

  // If not found in request
  if (!userId) {
    return res.status(404).json({
      name: "Not Found",
      description: "You have to send your ID.",
    });
  }

  // (2) Check user in our DB
  const user = await User.findById(userId).select({
    "account.two_fa.otp": 1,
    "account.email": 1,
  });

  // If not found in DB
  if (!user) {
    return res.status(404).json({
      name: "Not Found",
      description: "We could't find any user with this ID in our database",
    });
  }

  // (3) Check if this feature is already enabled
  if (user.account.two_fa.otp.is_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description: "This 2FA method (OTP) is already enabled!",
    });
  }

  // (4) Check if he already has a valid otp code in his mail box
  if (
    user.account.two_fa.otp.value &&
    user.account.two_fa.otp.expires_at > Date.now()
  ) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "Please, check your mailbox. The OTP code sent to your mailbox is still valid, we can't send you a new one when you already have a not expired one!",
    });
  }

  // If everything is okay. Then,

  // (5) Generate a new otp code
  const otp = Math.floor(100000 + Math.random() * 900000);

  // (6) Assign the otp code to user document
  user.account.two_fa.otp.value = otp;

  // (7) Save updated user document
  await user.save({ validateBeforeSave: false });

  // (8) Setup and send email with OTP code
  await sendEmail({
    email: user.account.email.value,
    subject: "OTP Code",
    message: `Hello, there.\nThis is your "${otp}" otp code, you have to provide it to verify your login attempt (Only valid for 15 min).`,
  });

  // (5) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "Please, check your mailbox, we have sent you another otp code instead of the expired one.",
  });
};

//=======================================================================

module.exports = {
  generateSendOTP_GET_service,
  generateSendOTP_POST_service,
  disableOTP_DELETE_service,
  verifyOTP_GET_service,
  verifyOTP_POST_service,
  re_generate_send_OTP_POST_service,
};
