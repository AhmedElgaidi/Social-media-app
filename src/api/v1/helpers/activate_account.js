const { create_token } = require("./token");

const sendEmail = require("./createSendEmail");

//=======================================================

module.exports = async ({ req, res, user, email }) => {
  // (1) Create the account activation token
  const activationToken = await create_token({
    id: user.id,
    secret: process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET,
    expiresIn: process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET_EXPIRES_IN,
  });

  // (2) Assign the token to the user document
  user.account.activation.account_activation_token = activationToken;

  // (3) Save user document into the DB
  await user.save({ validateBeforeSave: false });

  // (4) Setup activation link
  const activationUrl = `${req.protocol}://${process.env.HOST}:${process.env.PORT}/api/v1/auth/activate-account/${activationToken}`;
  const message = `Welcome back. \nPlease, click to activate your account, ${activationUrl}, you only have ${process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET_EXPIRES_IN}`;

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
      "Welcome back!, Your account was deactivated. So, we sent you an account activation link to proceed (Check your mail box)!!",
  });
};
