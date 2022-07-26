const User = require("./../../../../models/user/User");

const { verify_token } = require("./../../../../helpers/token");

const {
  verify_POST_validation,
} = require("./../../../../validations/auth/access/verify/verify.validations");

//============================================================
const verify_POST_service = async ({ req, res, next }) => {
  // (1) Get email verification token
  const verificationToken = verify_POST_validation({ req, res, next });

  // (2) Search about it in DB
  const user = await User.findOne({
    "account.email.verification_token": verificationToken,
  });

  // If user is not found
  if (!user) {
    return res.status(422).json({
      name: "Invalid email verification token",
      description:
        "Please, provide us with your correct email verification token!!",
    });
  }

  // (3) Validate and check it's expiration status
  await verify_token({
    token: verificationToken,
    secret: process.env.EMAIL_VERIFICATION_TOKEN_SECRET,
  });

  // (4) Make account's email verified
  user.account.email.is_verified = true;

  // (5) Delete the verification token
  user.account.email.verification_token = undefined;

  // (6) Save user document
  await user.save({ validateBeforeSave: false });

  // (7) Redirect user to the login page. So, he can login with his credentials
  res.status(301).redirect("/api/v1/auth/login");
};

module.exports = {
  verify_POST_service,
};
