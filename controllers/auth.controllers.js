// Our imports
const User = require("../models/user/User");
const sendEmail = require("../helpers/email");
const catchAsyncErrors = require("../errors/catchAsyncErrors");
const BaseError = require("../errors/BaseError");

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
      email_list: [{ email, is_verified_at: Date.now() }],
    },
  });

  // (3) Validate and sanitize: Did on schema level

  // (4) User document would be saved if everything is okay
  await user.save();

  // (5) send him email with account verification token
  const verificationToken = await user.createEmailVerificationToken(); // (1) create verification token
  const verificationUrl = `/verify-email/${verificationToken}`;
  const message = `Click to verify your email, ${verificationUrl}`;
  await sendEmail({
    // (2) Send email
    // email: email,
    email: "ahmedelgaidi260@gmail.com",
    subject: "Email verification link",
    message,
  })
    .then(() => console.log("email sent...."))
    .catch((err) => console.log(err));
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

const verifyAccount_POST = (req, res, next) => {
  const token = req.params.token;
  // verify token and make him log in
};

const login_GET = (req, res, next) => {
  res.json({
    message: "Welcome to the log in page....",
  });
};

const login_POST = async (req, res, next) => {
  try {
    // (1) Get Credentials
    const { email, password } = req.body;

    // (2) Check their existence
    if (!email || !password) {
      return next(new ErrorHandler("Please, send your credentials", 404));
    }

    // (3) Validate credentials
    // TODO:

    // (4) Sanitize credentials
    // TODO:

    // (5) Check for user existence
    const user = await User.findOne({
      email_list: email,
    });
    if (!user) {
      res.send("not found");
      return next(new ErrorHandler("User is not found", 404));
    }
    // bla bla
    user.generateAndSignAccessAndRefreshTokens();
    user.save().then(() => {
      res.send(user);
    });
    // (6) Check for password match
    // (5) get access token
    // (6) Check access token existence
    // (7) Verify access token
    // (8) Notify frontend with the status
  } catch (error) {
    next(new ErrorHandler("Something went wrong,\nPlease try again", 500));
  }
};

//======================================================================
// Export our controllers
module.exports = {
  signUp_GET,
  signUp_POST,
  verifyAccount_POST,
  login_GET,
  login_POST,
};
