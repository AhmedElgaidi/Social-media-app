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

  if (!user) {
    res.status(422).json({
      name: "Invalid email verification token",
      description:
        "Please, provide us with your correct email verification token!!",
    });
  }
  // (4) Validate and check it's expiration status
  await verify_token({
    token: verificationToken,
    secret: process.env.EMAIL_VERIFICATION_TOKEN_SECRET_EXPIRES_IN,
  });

  // (5) Make account's email verified
  user.account.email.is_verified = true;

  // (6) Add date of verification
  user.account.email.is_verified_at = Date.now();

  // (7) Delete the verification token
  user.account.email.verification_token = undefined;

  // (8) Save user document
  await user.save({ validateBeforeSave: false }).then(() =>
    res.status(200).json({
      status: "Success",
      message:
        "Now, you can log in with your credentials, go to the login page!",
      data: {
        user,
      },
    })
  );
};

module.exports = {
  verify_POST_service,
};
