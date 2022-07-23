const User = require("./../../../../models/user/User");
const {
  create_email_verification_token,
} = require("./../../../../helpers/tokens/emailVerificationToken");

const {
  signup_POST_validation,
} = require("./../../../../validations/auth/access/signup/signup.validations");

//============================================================
// Service (1)
const signup_GET_service = ({ req, res, next }) => {
  return res.json({
    name: "Success",
    message:
      "Please, type your first name, last name, user name, email, password and click the signup button",
  });
};

// Service (2)
const signup_POST_service = async ({ req, res, next }) => {
  // (1) Get user data from request
  const {
    first_name,
    last_name,
    user_name,
    email,
    password,
    confirm_password,
  } = req.body;

  // (2) Create user document
  const user = new User({
    info: {
      name: {
        first: first_name,
        last: last_name,
      },
      user_name,
    },
    account: {
      password: {
        value: password,
        confirm_password,
      },
      email: { value: email },
      reset: {
        password_reset_token: "",
      },
      activation: {},
      two_fa: {},
      recovery: {},
    },
  });

  // (3) Create and assign email verification token to user document
  const verificationToken = await create_email_verification_token(email);
  user.account.email.verification_token = verificationToken;

  // (4) Save user document into DB
  await user.save();

  // (5) Setup and send the verification email to user
  const verificationUrl = `${req.protocol}://${process.env.HOST}:${process.env.PORT}/api/v1/auth/verify-email/${verificationToken}`;
  const message = `Click to verify your email, ${verificationUrl}, you only have ${process.env.EMAIL_VERIFICATION_TOKEN_SECRET_EXPIRES_IN}`;
  // TODO: await sendEmail({ email, subject: "Email verification link", message });

  // (6) Inform the front-end about the status
  await res.status(201).json({
    status: "Success",
    message:
      "User created successfully, check your mail box to verify your account",
    data: {
      user,
    },
  });
};

module.exports = {
  signup_GET_service,
  signup_POST_service,
};
