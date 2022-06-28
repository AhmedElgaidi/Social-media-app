// Our imports
const User = require("../models/user/User");
const sendEmail = require("../helpers/email");
const BaseError = require("../errors/BaseError");

const verifyEmailVerificationTokenExpiration = require("../helpers/verifyEmailVerificationTokenExpiration");

//======================================================================

// My controllers
const signUp_GET = (req, res, next) => {
  res.json({
    message: "Welcome to the sign up page....",
  });
};

const signUp_POST = async (req, res, next) => {
  // (1) Get user data
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
      session: [
        {
          tokens: {
            access_token: { value: "23f4234" },
            refresh_token: { value: "1234f234" },
          },
          device: { name: "abc" },
        },
      ],
      password: {
        password,
        confirm_password,
      },
      email: { value: email },
    },
  });

  // (3) Validate and sanitize: Did on schema level

  // (4) User document would be saved if everything is okay

  // (5) send him email with account verification token
  const verificationToken = await user.createEmailVerificationToken(); // (1) create verification token
  const verificationUrl = `${req.protocol}://${process.env.HOST}:${process.env.PORT}/api/v1/auth/verify-email/${verificationToken}`;
  const message = `Click to verify your email, ${verificationUrl}`;
  await user.save();

  // await sendEmail({
  //   // (2) Send email

  //   email, //TODO:
  //   subject: "Email verification link",
  //   message,
  // })
  //   .then(() => console.log("email sent successfully ...."))
  //   .catch((err) => console.log(err));

  // (6) Notify frontend with the status
  await res.status(201).json({
    status: "Success",
    message:
      "User created successfully, check your mail box to verify your account",
    data: {
      user,
    },
  });
};

const verifyAccount_POST = async (req, res, next) => {
  // (1) Get email verification token
  // const verificationToken = req.params.token;
  const verificationToken = req.params.token;

  // (2) Search about it in DB
  const user = await User.findOne({
    "account.email.verification.token": verificationToken,
  });

  if (!user) {
    res.status(422).json({
      name: "Invalid email verification token",
      description:
        "Please, provide us with your correct email verification token!!",
    });
  }
  // (4) Check it's expiration date

  // (5) Make account's email verified
  if (user) {
    const isExpired = await verifyEmailVerificationTokenExpiration(
      verificationToken
    );
    if (isExpired) {
      res.status(422).json({
        name: "Invalid Token",
        description: "Your email verification token is expired!!!",
      });
    }
    console.log(isExpired);
  }

  // (6) Delete the verification token

  // (7) Save user document
};

const login_GET = (req, res, next) => {
  res.json({
    message: "Welcome to the log in page....",
  });
};

const login_POST = async (req, res, next) => {};

const writeQuery = async (req, res, next) => {};

//======================================================================
// Export our controllers
module.exports = {
  signUp_GET,
  signUp_POST,
  verifyAccount_POST,
  login_GET,
  login_POST,
  writeQuery,
};
