// Our imports
const User = require("../models/User");

const catchAsyncErrors = require("../errors/catchAsyncErrors");
const BaseError = require('../errors/BaseError');

//======================================================================

// My controllers
const signUp_GET = (req, res, next) => {
  res.json({
    message: "Welcome to the sign up page....",
  });
};

const signUp_POST = async (req, res, next) => {
  // (1) Get credentials
  const { email, password, user_name } = req.body;
  // (2) check there existence
  if (!email || !password) {
    // return next(new ErrorHandler("Please, send your credentials", 404));
  throw new BaseError('Invalid input', 'Please send your email, password and username', 422, true);

  }
  // throw new BaseError('test name', 'test value', 400, true);
  // (3) Validate credentials
  // TODO:
  // (4) Sanitize credentials
  // TODO:

  // (5`) Create user account
  const user = await User.create({
    info: {
      user_name
    },
    email_list: {
      email,
    },
    account: {
      password,
    },
  });

  // (5) Notify frontend with the status
  res.status(201).json({
    status: "Success",
    message: "User created successfully",
    data: {
      user,
    },
  });
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
  login_GET,
  login_POST,
};
