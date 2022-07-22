const User = require("./../../../../models/user/User");
const {
  create_password_reset_token_token,
} = require("./../../../../helpers/tokens/resetToken");

//=================================================================

const forgetPassword_GET_service = ({ req, res, next }) => {
  res.status(200).send("Welcome to forget password page...");
};

const forgetPassword_POST_service = async ({ req, res, next }) => {
  // (1) Get user email from request body
  const { email } = req.body;

  // If not found
  if (!email) {
    return res.status(404).json({
      status: "Invalid Input",
      description: "Please, send your email!!",
    });
  }

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

  // (3) Create password reset token
  const passwordResetToken = await create_password_reset_token_token(user.id);

  // (4) Assign the token to the user document
  user.account.reset.password_reset_token = passwordResetToken;

  // (5) Save user document into the DB
  await user.save({ validateBeforeSave: false });

  // (6) Setup activation link
  const passwordResetUrl = `${req.protocol}://${process.env.HOST}:${process.env.PORT}/api/v1/auth/reset-password/${passwordResetToken}/${user.id}`;
  const message = `Click to Reset your account, ${passwordResetUrl}, you only have ${process.env.PASSWORD_RESET_TOKEN_SECRET_EXPIRES_IN}. If you didn't asked for reset, then ignore this email.`;

  // (7) Send the activation link to user
  await sendEmail({
    email,
    subject: "Password Reset Link",
    message,
  });

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
