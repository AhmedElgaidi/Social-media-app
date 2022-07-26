const User = require("./../../../../models/user/User");

const { create_token } = require("./../../../../helpers/token");

const sendEmail = require("./../../../../helpers/createSendEmail");

const {
  forgetPassword_GET_validation,
} = require("./../../../../validations/auth/password/forget/forget.validations");

//=================================================================

const forgetPassword_GET_service = ({ req, res, next }) => {
  res.status(200).json({
    name: "Success",
    description:
      "Welcome to forget password page.\n Please, send us your email so you can create new password.",
  });
};

const forgetPassword_POST_service = async ({ req, res, next }) => {
  // (1) Get user email from request body
  const { email } = forgetPassword_GET_validation({ req, res, next });

  // (2) Check it in the DB
  const user = await User.findOne({
    "account.email.value": email,
  });

  // If user not found
  if (!user) {
    // To prevent our users from enumeration
    return res.status(200).json({
      status: "Success",
      description: "Please, check your mailbox for our password reset link!!",
    });
  }

  // If everything is okay. Then,

  // (3) Create password reset token
  const passwordResetToken = await create_token({
    id: user.id,
    secret: process.env.PASSWORD_RESET_TOKEN_SECRET,
    expiresIn: process.env.PASSWORD_RESET_TOKEN_SECRET_EXPIRES_IN,
  });

  // (4) Assign the token to the user document
  user.account.reset.password_reset_token = passwordResetToken;

  // (5) Save user document into the DB
  await user.save({ validateBeforeSave: false });

  // (6) Setup activation link
  const passwordResetUrl = `${req.protocol}://${process.env.HOST}:${process.env.PORT}/api/v1/auth/reset-password/${passwordResetToken}`;
  const message = `Click to Reset your account, ${passwordResetUrl}, you only have ${process.env.PASSWORD_RESET_TOKEN_SECRET_EXPIRES_IN}. If you didn't asked for reset, then ignore this email.`;

  // (7) Send the activation link to user
  await sendEmail({
    email,
    subject: "Password Reset Link",
    message,
  });
  TODO: console.log(passwordResetUrl);

  // (8) Inform the front-end with the status
  return res.status(200).json({
    status: "Success",
    description: "Please, check your mailbox for our password reset link!!",
  });
};

module.exports = {
  forgetPassword_GET_service,
  forgetPassword_POST_service,
};
