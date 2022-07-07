const twilio = require("twilio");
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

const {
  create_account_activation_token,
  verify_account_activation_token,
} = require("../helpers/tokens/accountActivation");

const {
  create_password_reset_token_token,
  verify_password_reset_token_token,
} = require("../helpers/tokens/resetToken");

const correct_password = require("../helpers/password");

const speakeasy = require("speakeasy");
const is_otp_match = require("../helpers/is_otp_match");
const is_phone_code_match = require("../helpers/is_phone_code_match");
const giveAccess = require("../helpers/giveAccess");

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
      reset: {
        password_reset_token: "",
      },
      activation: {},
      two_fa: {},
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

  // (4) Check if account is active or not
  const is_account_active = user.account.activation.is_account_active;

  // If user deactivated his account
  if (!is_account_active) {
    // send him email. So, he can activate his account again!!

    // (1) Create the account activation token
    const activationToken = await create_account_activation_token(
      user.account.email.value
    );

    // (2) Assign the token to the user document
    user.account.activation.account_activation_token = activationToken;

    // (3) Save user document into the DB
    await user.save({ validateBeforeSave: false });

    // (4) Setup activation link
    const activationUrl = `${req.protocol}://${process.env.HOST}:${process.env.PORT}/api/v1/auth/activate-account/${activationToken}`;
    const message = `Click to activate your account, ${activationUrl}, you only have ${process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET_EXPIRES_IN}`;

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
        "Welcome back!, Your account was deactivated. So, we sent you an account activation link to proceed!!",
    });
  }

  ////////=========================================================
  // Check for 2fa methods
  // (1) If TOTP is enabled
  const is_totp_enabled = user.account.two_fa.totp.is_enabled;
  if (is_totp_enabled) {
    return res.status(301).redirect("/totp/verify");
  }

  // (2) If OTP is enabled
  const is_otp_enabled = user.account.two_fa.otp.is_enabled;
  console.log(is_otp_enabled);
  if (is_otp_enabled) {
    return res.status(301).redirect("/2fa/otp/verify");
  }

  // (3) If SMS is enabled
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;
  if (is_sms_enabled) {
    return res.status(301).redirect("/2fa/sms");
  }

  ////////=========================================================
  // These steps should be done when there is no 2fa method enabled and after
  // every successful verification 2fa method used.
  await giveAccess({ user, req, res });
};

const writeQuery_GET = async (req, res, next) => {
  await User.find().then((users) => res.send(users));
};
const writeQuery_POST = async (req, res, next) => {
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

    //If it's not found!!
    if (!updatedUser) {
      res.status(401).json({
        name: "Invalid Token",
        description:
          "Sorry, we couldn't find the refresh token associated to this account!!!",
      });
    }

    // (3) Check if account is active or not
    const is_account_active = user.account.activation.is_account_active;

    // If it's deactivated
    if (!is_account_active) {
      return res.status(404).json({
        status: "Failed",
        message:
          "your account is deactivated. Please, check your account mail box to re-activate it so you can log in again!!",
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

const activateAccount_POST = async (req, res, next) => {
  // (1) Get account activation token from request
  const token = req.params.token;

  // (2) Validate token and check it's expiration date
  await verify_account_activation_token(token).catch((error) => {
    // (1) if user manipulated the token
    if (error.toString().includes("invalid signature")) {
      return res.status(422).json({
        name: "Invalid Token",
        description: "Sorry, your access token is manipulated!!",
      });
    }

    // (2) if access token is expired
    res.status(401).json({
      name: "Invalid Token",
      description:
        "Sorry, your access token is expired. Use your refresh token to get new tokens!!",
    });
  });

  // (3) If everything is okay, then check it in the DB
  const user = await User.findOne({
    "account.activation.account_activation_token": token,
  }).select({
    "account.activation": 1,
  });

  // If user not found
  if (!user) {
    return res.status(404).json({
      name: "Invalid Credentials",
      description: "Please, provide us with your own correct credentials!!",
    });
  }

  // (4) If account is already activated
  const is_account_active = user.account.activation.is_account_active;
  if (is_account_active) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Your account is already activated!!",
    });
  }

  // (5) Update user document (make it active)
  user.account.activation.is_account_active = true;

  // (6) Save user document
  await user.save();

  // (7) Inform front-end about the status
  res.status(200).json({
    status: "Success",
    message:
      "Your account is activated successfully. Now you can login and play around!!!",
  });
};

const deactivateAccount_POST = async (req, res, next) => {
  // (1) Get userId from protect middleware
  const userId = req.userId;

  // (2) Get user document from DB
  const user = await User.findById(userId).select({
    "account.activation.is_account_active": 1,
  });

  // (3) check if it's already deactivated
  // I don't need this as i've put the is_account_active middleware before this controller!!!

  // (4) Update user document
  user.account.activation.is_account_active = false;

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

const changePassword_POST = async (req, res, next) => {
  // (1) Get userId and user data from request
  const { old_password, password, confirm_password } = req.body;
  const userId = req.userId;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.password": 1,
  });

  // (3) check if his old password is correct
  const isCorrectPassword = await correct_password(
    old_password,
    user.account.password.value
  );

  // If password is not correct
  if (!isCorrectPassword) {
    res.status(401).json({
      name: "Invalid credentials",
      description: "Your old password is not correct!!",
    });
  }

  // (4) Assign the new password to user object
  user.account.password.value = password;
  user.account.password.confirm_password = confirm_password;

  // (5) Save user document
  await user.save();

  // (6) Inform front-end about the status
  res.status(200).json({
    status: "Success",
    description: "Congrats, your password changed successfully!!",
  });
};

const forgetPassword_GET = (req, res, next) => {
  res.status(200).send("Welcome to forget password page...");
};

const forgetPassword_POST = async (req, res, next) => {
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

const resetPassword_GET = (req, res, next) => {
  // /reset-password/token/userId
  res.send(
    "This is where you enter your new password (last step in the process)"
  );
};

const resetPassword_POST = async (req, res, next) => {
  // (1) Get new passwords and password reset token from request
  const { token: passwordResetToken, userId } = req.params,
    { password, confirm_password } = req.body;

  // (2) Check for their existence in the request

  // If token is not found
  if (!passwordResetToken) {
    return res.status(404).json({
      status: "Not Found",
      description: "Please, send your token!!",
    });
  }

  // If user id is not found
  if (!userId) {
    return res.status(404).json({
      status: "Not Found",
      description: "Please, send your ID!!!",
    });
  }

  // If password and confirm_password are not found
  if (!(password && confirm_password)) {
    return res.status(404).json({
      status: "Not Found",
      description: "Please, send your new password!!",
    });
  }

  // (2) Verify password reset token
  await verify_password_reset_token_token(passwordResetToken).catch((error) => {
    // (1) If user manipulated the token
    if (error.toString().includes("invalid signature")) {
      return res.status(422).json({
        name: "Invalid Token",
        description: "Sorry, your password reset token is manipulated!!",
      });
    }

    // (2) if password reset token is expired
    res.status(401).json({
      name: "Invalid Token",
      description: "Sorry, your password reset token is expired.",
    });
  });

  // (3) Check token and ID in DB
  const user = await User.findOne({
    "account.reset.password_reset_token": passwordResetToken,
  }).select({
    "account.reset": 1,
    "account.password": 1,
  });

  // If user not found
  if (!user) {
    return res.status(422).json({
      status: "Invalid Input",
      description: "We could't find this token associated to any account!!!",
    });
  }

  // IF user is found and really has this token, but his id doesn't match
  if (user && user.id !== userId) {
    return res.status(422).json({
      status: "Invalid Input",
      description: "The given token and ID don't match!!!!",
    });
  }

  // Now, everything is okay. So, we can establish the new password

  // (4) Assign the new password
  user.account.password.value = password;
  user.account.password.confirm_password = confirm_password;

  // (5) Remove reset token from DB
  user.account.reset.password_reset_token = undefined;

  // (6) Save updated user
  await user.save();

  // (7) Inform the frontend with the status
  res.status(200).json({
    Status: "Success",
    description: "Congrats, your new password is saved successfully.",
  });
};

const allTwoFactorAuthenticationMethods_GET = (req, res, next) => {
  res
    .status(200)
    .send(
      "The page where the user choose his preferred method of having 2fa in his account. \nThe methods i'm working on are: \n- authenticator app code (google authenticator) \n- text message(eg. six digits) \n- security question \n- send code to the mailbox"
    );
};

// method (1): TOTP (Time-based One-Time Password)
// we need to do this during setup and do the verifying part again when we need that.
const generateSecretTOTP_POST = async (req, res, next) => {
  // (1) Generate the secret
  const temp_secret = speakeasy.generateSecret();

  // (2) Get user document
  const user = await User.findById(req.userId).select({
    "account.two_fa.totp": 1,
  });

  // (3) Check if the user already has a secret
  if (user.account.two_fa.totp.secret) {
    res.status(422).json({
      name: "Invalid Input",
      description: "you already enabled this feature!!!",
    });
  }
  // (4) Assign the temp_secret to the user object
  user.account.two_fa.totp.temp_secret = temp_secret.base32;

  // (5) Save user document
  await user.save();

  // (6) send the secret to the front-end to generate a qrcode based on it. So the user can scan it and give us
  // the 6 digits resulted from any authenticating app such as: Google authenticator
  // [NOTE]: This would be the first and last time to share the secret (It should be saved on the DB)!!!!
  res.send({
    message:
      "The frontend should use this given secret and create a QR code based on it, so the user can scan it and send back the generated digits.",
    secret: temp_secret.base32,
  });
};

const totpVerify_GET = (req, res, next) => {
  res
    .status(200)
    .send(
      "The page where you enter the code generated from you authenticator app."
    );
};
const verifyTOTP_during_setup_POST = async (req, res, next) => {
  // (1) Get TOTP token
  const { token } = req.body;

  // If not found
  if (!token) {
    res.status(404).json({
      name: "Not Found",
      description:
        "Please, send your token generated from your authenticator app!!",
    });
  }

  // (2) Get user document
  const user = await User.findById(req.userId).select({
    "account.two_fa.totp": 1,
  });

  // Check if the user already has a secret
  if (user.account.two_fa.totp.secret) {
    res.status(422).json({
      name: "Invalid Input",
      description: "you already enabled this feature!!!",
    });
  }

  // (3) Check the given token against the previously assigned temp_secret
  const isVerified = speakeasy.totp.verify({
    secret: user.account.two_fa.totp.temp_secret,
    encoding: "base32",
    token,
  });

  // If verification failed
  if (!isVerified) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Sorry, your given totp token is not valid.",
    });
  }

  // If everything is okay until now?
  // (4) Save the temp_secret permanently
  user.account.two_fa.totp.secret = user.account.two_fa.totp.temp_secret;

  // (5) Delete the temp_secret field
  user.account.two_fa.totp.temp_secret = undefined;

  // (6) make the totp is enabled
  user.account.two_fa.totp.is_enabled = true;

  // (6) Save user document
  await user.save();

  // (7) Inform the frontend with the status
  res.status(200).json({
    status: "Success",
    description: "Congrats, you successfully enabled 2FA feature (TOTP).",
  });
};
const verifyTOTP_during_login_POST = async (req, res, next) => {
  // (1) Get TOTP token
  const { userId, token } = req.body;

  // If token is not found
  if (!token) {
    res.status(404).json({
      name: "Not Found",
      description:
        "Please, send your token generated from your authenticator app!!",
    });
  }

  // If userId is not found
  if (!token) {
    res.status(404).json({
      name: "Not Found",
      description: "Please, send your ID!!",
    });
  }

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.two_fa.totp": 1,
    "account.session": 1,
  });

  // (3) Check if the user doesn't have a secret
  if (!user.account.two_fa.totp.is_enabled) {
    res.status(422).json({
      name: "Invalid Input",
      description: "Sorry, you don't have this 2fa method (TOTP) enabled.",
    });
  }

  // (4) Check the given token against the stored secret
  const isVerified = speakeasy.totp.verify({
    secret: user.account.two_fa.totp.secret,
    encoding: "base32",
    token,
  });

  // If verification failed
  if (!isVerified) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Sorry, your given totp token is not valid.",
    });
  }

  // Give access
  await giveAccess({ user, req, res });
};
const disableTOTP_DELETE = async (req, res, next) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get user document from DB
  const user = await User.findById(userId).select({
    "account.two_fa.totp": 1,
  });

  // (3) Update the user document
  user.account.two_fa.totp = undefined;

  // (4) Save user document
  await user.save();

  // (5) Inform the frontend with the status
  res.status(200).json({
    status: "Success",
    description:
      "You disabled the TOTP feature (keep in mind that you are less secure now!!)",
  });
};

// method (2): Email him OTP code  (One-Time Password)
const otpPage_during_setup_GET = (req, res, next) => {
  res.status(200).send("The page where you enter sent code over email.");
};
const enableOTP_POST = async (req, res, next) => {
  // (1) Get userId from protect middleware
  const userId = req.userId;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.two_fa.otp": 1,
  });

  // If it's already enabled
  if (user.account.two_fa.otp.is_enabled) {
    res.status(422).json({
      status: "Invalid Input",
      description: "This feature (OTP) is already enabled",
    });
  }

  // (3) Update user document (enable otp)
  user.account.two_fa.otp.is_enabled = true;

  // (4) Save user document
  await user.save();

  // (5) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description: "Congrats, you enabled a 2fa method (OTP).",
  });
};

const disableOTP_DELETE = async (req, res, next) => {
  // (1) Get userId from protect middleware
  const userId = req.userId;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.two_fa.otp": 1,
  });

  // If it's already disabled
  if (!user.account.two_fa.otp.is_enabled) {
    res.status(422).json({
      name: "Invalid Input",
      description: "This feature (OTP) is already disabled.",
    });
  }

  // (3) Update user document (disable otp)
  user.account.two_fa.otp.is_enabled = false;
  user.account.two_fa.otp.value = undefined;
  user.account.two_fa.otp.created_at = undefined;
  user.account.two_fa.otp.expires_at = undefined;

  // (4) Save user document
  await user.save();

  // (5) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "You disabled a 2fa method (OTP) successfully (Keep in mind, you are less secure now!!).",
    user,
  });
};

const generateSendOTP_POST = async (req, res, next) => {
  // (1) Generate otp (random 6 digits)
  const otp = Math.floor(100000 + Math.random() * 900000);

  // (2) Get user document from request
  let user = req.user;

  // (3) Assign the otp code to user document
  user.account.two_fa.otp.value = otp;

  // (4) Save updated user document
  await user.save({ validateBeforeSave: false });

  // (5) Setup and send email with OTP code
  await sendEmail({
    email: user.account.email.value,
    subject: "OTP Code",
    message: `Hello, there.\nThis is your "${otp}" otp code, you have to provide it to verify your login attempt (Only valid for 15 min).`,
  });

  // (5) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "Please, check your mailbox. To verify your identity. So, you can log in",
  });
};

const otpPage_during_verifying_GET = (req, res, next) => {
  res
    .status(200)
    .send(
      "The page where user enters his email otp code and wait for it's verification"
    );
};

const verifyOTP_POST = async (req, res, next) => {
  // (1) Get userId and otp from request
  const { userId, otp } = req.body;

  // If ID is not found
  if (!userId) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find the user ID.",
    });
  }

  // IF otp is not found
  if (!otp) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find the otp.",
    });
  }

  // If otp length isn't correct, we don't have to check it in our db, right!
  if (otp.toString().length != 6) {
    res.status(422).json({
      name: "Invalid Input",
      description: "This otp length can't be correct!",
    });
  }

  // (2) Check user by it' ID in our DB
  const user = await User.findById(userId).select({
    "account.two_fa.otp": 1,
    "account.session": 1,
  });

  // If user not found
  if (!user) {
    res.status(422).json({
      status: "Invalid Input",
      description: "We could find any user with this given ID.",
    });
  }

  // (3) Check if user has this token
  const otp_found = user.account.two_fa.otp.value;

  // If otp is not found in DB
  if (!otp_found) {
    res.status(404).json({
      name: "Not Found",
      description: "We could't find any otp code assigned to this user.",
    });
  }

  // (4) Check if otp against saved otp in our DB
  const is_match = await is_otp_match(otp, otp_found);

  // NO match?
  if (!is_match) {
    res.status(422).json({
      name: "Invalid Input",
      description: "This given otp didn't match with our sent otp.",
    });
  }

  // (5) Check if it's expired
  const is_otp_expired = user.account.two_fa.otp.expires_at < Date.now();

  // IF it's expired
  if (is_otp_expired) {
    // (1) Delete otp from user document
    user.account.two_fa.otp.value = undefined;
    user.account.two_fa.otp.expires_at = undefined;
    user.account.two_fa.otp.created_at = undefined;

    // (2) Save it in DB
    await user.save();
    return res.status(422).json({
      name: "Invalid Input",
      description:
        "This otp is already expired, click the resend button to send you a new valid one!",
    });
  }

  // (6) Delete the otp from user document, so he/she can't use it again even it's valid (one time use!)
  user.account.two_fa.otp.value = undefined;
  user.account.two_fa.otp.expires_at = undefined;
  user.account.two_fa.otp.created_at = undefined;

  // (7) Give him/her access
  await giveAccess({ user, req, res });
};

const re_generate_send_OTP_POST = async (req, res, next) => {
  // (1) Get userId from request
  const { userId } = req.body;

  // If not found in request
  if (!userId) {
    return res.status(404).json({
      name: "Not Found",
      description: "You have to send your ID.",
    });
  }

  // (2) Check user in our DB
  const user = await User.findById(userId).select({
    "account.two_fa.otp": 1,
    "account.email": 1,
  });

  // If not found in DB
  if (!userId) {
    return res.status(404).json({
      name: "Not Found",
      description: "We could't find any user with this ID in our database",
    });
  }
  console.log(user);

  // (3) Check expiration of saved otp in our DB
  // If expires_at field is undefined, it means it's deleted before!!
  if (user.account.two_fa.otp.expires_at != undefined) {
    // if it's not deleted, then check it's value is expired or not
    const is_otp_expired = user.account.two_fa.otp.expires_at < Date.now();

    // If it's not expired
    if (!is_otp_expired) {
      const remaining = user.account.two_fa.otp.expires_at.getMinutes();

      return res.status(400).json({
        name: "Bad request",
        description: `The sent otp to your mailbox is not expired yet, ${remaining} minutes remaining.`,
      });
    }
  }

  // (4) Generate a new otp code
  const otp = Math.floor(100000 + Math.random() * 900000);

  // (5) Assign the otp code to user document
  user.account.two_fa.otp.value = otp;

  // (6) Save updated user document
  await user.save({ validateBeforeSave: false });

  // (7) Setup and send email with OTP code
  await sendEmail({
    email: user.account.email.value,
    subject: "OTP Code",
    message: `Hello, there.\nThis is your "${otp}" otp code, you have to provide it to verify your login attempt (Only valid for 15 min).`,
  });

  // (5) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "Please, check your mailbox, we have sent you another otp code instead of the expired one.",
  });
};

// method (3): Text message (send code as sms)
const smsPage_during_setup_GET = (req, res, next) => {
  res
    .status(200)
    .send(
      "The page where you enter phone number and start to setup your sms as 2fa."
    );
};

const generateSendSMS_POST = async (req, res, next) => {
  // (1) Get userId and phone number from request
  const { phone } = req.body,
    userId = req.userId;

  // If userId is not found
  if (!userId) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find your ID in the request.",
    });
  }

  // If phone number is not found
  if (!phone) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find your phone number in the request.",
    });
  }

  // (2) Check if the given phone number is not valid
  if (phone.toString().length != 11) {
    return res.status(422).json({
      name: "Invalid Input",
      description:
        "Please, provide use with your correct phone number in this format (eg. 01299929977)'\nWe only accept numbers from Egypt for now.",
    });
  }

  // (3) Get user document
  const user = await User.findById(userId).select({
    "account.two_fa.sms": 1,
    "account.email": 1,
  });

  // (4) Check if this feature is already enabled
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  // If not enabled
  if (is_sms_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description: "This 2fa method (sms) is already enabled in your account.",
    });
  }

  // (5) Check if we already assigned his/her document a code
  if (user.account.two_fa.sms.value != undefined) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "We already assigned and sent you a code in an SMS!!",
    });
  }

  // (6) Generate a random 6 digits code
  const code = Math.floor(100000 + Math.random() * 900000);
  console.log("SMS code:", code);

  // (7) Assign the code to the user document
  user.account.two_fa.sms.value = code;

  // 8) Save user document
  await user.save();

  // (9) Setup and send sms with the generated code
  // Setup the client
  const client = new twilio(
    process.env.TWILIO_ACCOUNT_ID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Send the SMS
  // TODO: We'll just see it in the console, to decrease call to twilio API
  // await client.messages.create({
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: "+2" + phone,
  //   body: `Hello, there.\nThis is your "${code}" 2fa (Only valid for 15 min).`,
  // });

  // (10) Inform the frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "Please, send the received code to this endpoint /2fa/sms/verify .",
  });
};

const smsPage_GET = (req, res, next) => {
  res.status(200).send("The page where you enter sent code over SMS");
};

const verifySMS_POST = async (req, res, next) => {
  // (1) Get userId and code from request
  const { code } = req.body,
    userId = req.userId;

  // If code is not sent in request
  if (!code) {
    res.status(404).json({
      name: "Not Found",
      description: "We can't find the code in the request.",
    });
  }

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.two_fa.sms": 1,
  });

  // (3) Get user saved hashed code
  const hashedCode = user.account.two_fa.sms.value;

  // If hashed code is undefined, it means user haven't assigned any code before
  if (hashedCode == undefined) {
    res.status(422).json({
      name: "Invalid Input",
      description:
        "Sorry, you need to ask for code first from this endpoint /2fa/sms .",
    });
  }
  // (4) Check the code against the saved code
  const is_match = await is_phone_code_match(code, hashedCode);

  // If code is not valid
  if (!is_match) {
    res.status(422).json({
      name: "Invalid Input",
      description: "Sorry, the given code is not valid",
    });
  }

  // (5) check if this feature is already enabled
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  // If it's already enabled
  if (is_sms_enabled) {
    res.status(422).json({
      name: "Success",
      description: "This 2fa method (SMS) is already enabled in your account.",
    });
  }

  // (6) If it's valid, then make phone verified and enable this 2fa feature
  user.account.two_fa.sms.phone.is_verified = true;
  user.account.two_fa.sms.is_enabled = true;

  // (7) Save user document
  await user.save();

  // (8) Inform the frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "Congrats, you enabled the 3rd 2fa method (code over SMS) successfully.",
  });
};

const disableSMS_DELETE = async (req, res, next) => {
  // (1) Get userId from request
  const userId = req.userId;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.two_fa.sms": 1,
  });

  // (3) Check if this method is already disabled
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  // If it's already disabled
  if (!is_sms_enabled) {
    res.status(422).json({
      name: "Success",
      description: "Your account is already disabled.",
    });
  }

  // (3) Update user document
  user.account.two_fa.sms.is_enabled = false;
  user.account.two_fa.sms.value = undefined;
  user.account.two_fa.sms.expires_at = undefined;
  user.account.two_fa.sms.created_at = undefined;

  // (4) Save user document
  await user.save();

  // (5) Inform the frontend with the status
  res.status(200).json({
    name: "Success",
    description: "You have disabled this 2fa method (SMS) successfully.",
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
  activateAccount_POST,
  deactivateAccount_POST,
  deleteAccount_DELETE,
  changePassword_POST,
  forgetPassword_GET,
  forgetPassword_POST,
  resetPassword_GET,
  resetPassword_POST,
  allTwoFactorAuthenticationMethods_GET,
  generateSecretTOTP_POST,
  verifyTOTP_during_setup_POST,
  verifyTOTP_during_login_POST,
  totpVerify_GET,
  disableTOTP_DELETE,
  enableOTP_POST,
  disableOTP_DELETE,
  generateSendOTP_POST,
  otpPage_during_setup_GET,
  verifyOTP_POST,
  otpPage_during_verifying_GET,
  re_generate_send_OTP_POST,
  smsPage_during_setup_GET,
  generateSendSMS_POST,
  smsPage_GET,
  verifySMS_POST,
  disableSMS_DELETE,
};
