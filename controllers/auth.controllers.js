// Our imports
const User = require("../models/user/User");
const sendEmail = require("../helpers/createSendEmail");

const {
  create_email_verification_token,
  verify_email_verification_token,
} = require("../helpers/tokens/emailVerificationToken");

const { create_access_token } = require("../helpers/tokens/accessToken");

const {
  create_refresh_token,
  verify_refresh_token,
} = require("../helpers/tokens/refreshToken");

const correct_password = require("../helpers/password");
//======================================================================

// My controllers
const signUp_GET = (req, res, next) => {
  res.json({
    message: "Welcome to the sign up page....",
  });
};

const signUp_POST = async (req, res, next) => {
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

const verifyAccount_POST = async (req, res, next) => {
  // (1) Get email verification token
  const verificationToken = req.params.token;

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
  await verify_email_verification_token(verificationToken);

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

const login_GET = (req, res, next) => {
  res.json({
    message: "Welcome to the log in page....",
  });
};

const login_POST = async (req, res, next) => {
  // (1) Get user data from request
  const { email, password } = req.body;

  // If they aren't found
  if (!(email && password)) {
    res.status(422).json({
      name: "Invalid Credentials",
      description: "Please, provide us with all of your credentials!!",
    });
  }

  // (2) check for user email in our DB
  const user = await User.findOne({
    "account.email.value": email,
  });

  // User is not found
  if (!user) {
    res.status(404).json({
      name: "Invalid Credentials",
      description: "Please, provide us with your own correct credentials!!",
    });
  }

  // (3) Check for password match
  const isCorrectPassword = await correct_password(
    password,
    user.account.password.value
  );

  // If password is not correct
  if (!isCorrectPassword) {
    res.status(401).json({
      name: "Invalid credentials",
      description: "Please, provide us with your own correct credentials!!",
    });
  }

  // TODO: check if he is verified or not
  // (4) Create access and refresh token
  const access_token = await create_access_token(user.id);
  const refresh_token = await create_refresh_token(user.id);

  // (5) Get device info
  const device = req.device;

  //(6) Assign tokens and device info to the user document
  user.account.session.push({
    tokens: {
      access_token,
      refresh_token,
    },
    device,
  });

  // (7) Save user document
  await user.save({ validateBeforeSave: false });

  // (8) Inform user about status
  await res.status(200).json({
    status: "Success",
    message: "congrats, you now can access all our private resources!!",
    "tokens number": user.account.session.length,
    tokens: user.account.session,
  });
};

const writeQuery_GET = async (req, res, next) => {
  await User.find().then((users) => res.send(users));
};
const writeQuery_POST = (req, res, next) => {
  res.send("Consider it a private resource!");
};

const refreshToken_POST = async (req, res, next) => {
  // (1) Get refresh token
  const refresh_token =
    req.headers["x-refresh-token"] ||
    req.body.refresh_token ||
    req.query.refresh_token;

  // (2) Check for its existence in the received request
  if (!refresh_token) {
    res.status(404).json({
      name: "Invalid Input",
      description: "Your refresh token is not found!!",
    });
  }
  // (3) verify refresh token
  const decodedRefreshToken = await verify_refresh_token(refresh_token).catch(
    // Errors in refresh token verification:
    (error) => {
      //  (1) if refresh token is manipulated
      if (error.toString().includes("invalid signature")) {
        return res.status(422).json({
          name: "Invalid Token",
          description: "Sorry, your refresh token is manipulated!!",
        });
      }

      // (2) if refresh token is expired
      return res.status(401).json({
        name: "Invalid Token",
        description:
          "Sorry, your refresh token is expired, you need to log in again with your credentials!!",
      });

      // (3)
      // TODO: If it's expired => delete the session data (both tokens) => log user out => now,
      // he needs to login from scratch with his credentials
    }
  );

  // (4) Create new access and refresh tokens
  const newAccessToken = await create_access_token(decodedRefreshToken._id);
  const newRefreshToken = await create_refresh_token(decodedRefreshToken._id);

  // (5) Get user document from decoded refresh token
  await User.findById(decodedRefreshToken._id).then(async (user) => {
    // (1) If user document is not found
    if (!user) {
      res.status(404).json({
        name: "Invalid Input",
        description:
          "Sorry, we couldn't find the associated account to this refresh token!!!",
      });
    }

    // (2) Check if received refresh token is among other user refresh tokens!!
    const updatedUser = user.account.session.find(
      (el) => el.tokens.refresh_token === refresh_token
    );

    // (3) If it's not found!!
    if (!updatedUser) {
      res.status(401).json({
        name: "Invalid Token",
        description:
          "Sorry, we couldn't find the refresh token associated to this account!!!",
      });
    }

    // If everything is okay??? then....
    // (6) Assign user document the new tokens and device info
    updatedUser.tokens.access_token = newAccessToken;
    updatedUser.tokens.refresh_token = newRefreshToken;
    updatedUser.device = req.device;

    // (7) Save user document and inform the front-end with the status
    await user.save({ validateBeforeSave: false }).then(() =>
      res.status(200).json({
        status: "Success",
        message: "You are assigned new access and refresh tokens",
        tokens: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
      })
    );
  });
};

// Get all account session
const sessions_GET = async (req, res, next) => {
  const userId = req.userId;
  const access_token = req.headers["x-access-token"] || req.body.access_token;

  const user = await User.findById(userId).select({
    "account.session": 1,
    _id: 0,
  });

  const accountCurrentSession = user.account.session.find(
    (el) => el.tokens.access_token === access_token
  );
  const accountOtherSession = user.account.session.filter(
    (el) => el.tokens.access_token !== access_token
  );

  res.status(200).json({
    status: "Success",
    sessions: {
      Current: accountCurrentSession,
      Other: {
        count: accountOtherSession.length,
        sessions: accountOtherSession,
      },
    },
  });
};

// Delete a user session
const revokeSession_DELETE = async (req, res, next) => {
  // (1) Get access token and userId from protect middleware
  const access_token = req.access_token,
    userId = req.userId;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.session": 1,
  });

  // (3) Remove current session from user document
  user.account.session = user.account.session.filter(
    (el) => el.tokens.access_token !== access_token
  );

  // (4) save updated user document and inform front-end with the status
  await user.save().then((user) => {
    res.status(200).json({
      status: "Success",
      message: "Congrats, your desired session is deleted successfully!!",
      remained_session: {
        count: user.account.session.length,
        sessions: user.account.session,
      },
    });
  });
};

// Log user out
const logout_DELETE = async (req, res, next) => {
  // (1) Get access token and userId from protect middleware
  const access_token = req.access_token,
    userId = req.userId;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.session": 1,
  });

  // (3) Remove current session from user document
  user.account.session = user.account.session.filter(
    (el) => el.tokens.access_token !== access_token
  );

  // (4) save updated user document
  await user.save();

  // (5) Inform front-end with the status
  res.status(200).json({
    status: "Success",
    message: "You are logged out successfully!!",
  });
};

const activateAccount_GET = (req, res, next) => {};

const deactivateAccount_GET = async (req, res, next) => {
  // (1) Get userId from protect middleware
  const userId = req.userId;

  // (2) Get user document from DB
  const user = await User.findById(userId).select({
    "account.is_account_active": 1,
  });

  // (3) check if it's already deactivated
  // I don't need this as i've put the is_account_active middleware before this controller!!!

  // (4) Update user document
  user.account.is_account_active = false;

  // (5) Save updated user document
  await user.save();

  // (6) Inform front-end about the status
  res.status(200).json({
    status: "Success",
    message: "Your account is deactivated successfully!!!",
  });
};

const deleteAccount_DELETE = async (req, res, next) => {
  // (1) Get userId from protect middleware
  const userId = req.userId;

  // (2) Delete user document from DB
  await User.deleteOne({ id: userId });

  // (3) Inform front-end with the status
  res.status(200).json({
    status: "Success",
    message: "Your account is deleted permanently successfully!!!",
  });
};

//======================================================================
// Export our controllers
module.exports = {
  signUp_GET,
  signUp_POST,
  verifyAccount_POST,
  login_GET,
  login_POST,
  writeQuery_GET,
  writeQuery_POST,
  refreshToken_POST,
  sessions_GET,
  revokeSession_DELETE,
  logout_DELETE,
  activateAccount_GET,
  deactivateAccount_GET,
  deleteAccount_DELETE,
};
