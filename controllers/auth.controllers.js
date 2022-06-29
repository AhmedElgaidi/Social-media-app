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
  // (4) Create access token
  const accessToken = await create_access_token(user.id);

  // (5) Create refresh token
  const refreshToken = await create_refresh_token(user.id);

  //(6) Assign tokens to user document
  user.account.session.push({
    tokens: {
      access_token: {
        value: accessToken,
      },
      refresh_token: {
        value: refreshToken,
      },
    },
    device: "abc",
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
    req.headers["x-refresh-token"] || req.body.refresh_token;

  // (2) Check for its existence
  if (!refresh_token) {
    res.status(404).json({
      name: "Invalid Input",
      description: "Your refresh token is not found!!",
    });
  }
  // (3) verify (validate/ check expiration) refresh token
  const decodedRefreshToken = await verify_refresh_token(refresh_token).catch(
    (error) => {
      //  if user manipulated the token
      if (error.toString().includes("invalid signature")) {
        return res.status(422).json({
          name: "Invalid Token",
          description: "Your refresh token is manipulated!!",
        });
      }
      return res.status(401).json({
        name: "Invalid Token",
        description: "Your refresh token is expired!!",
      });
    }
  );

  const newAccessToken = await create_access_token(decodedRefreshToken._id);
  const newRefreshToken = await create_refresh_token(decodedRefreshToken._id);

  await User.findById(decodedRefreshToken._id).then(async (user) => {
    const userEditedTokens = user.account.session.find(
      (el) => el.tokens.refresh_token.value === refresh_token
    ).tokens;

    console.log({ userEditedTokens });
    userEditedTokens.access_token.value = newAccessToken;
    userEditedTokens.refresh_token.value = newRefreshToken;

    await user.save({ validateBeforeSave: false }).then(() =>
      res.status(200).json({
        status: "Success",
        message: "Your assigned new access and refresh tokens",
        tokens: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
      })
    );
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
};
