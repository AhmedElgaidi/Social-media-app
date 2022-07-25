const User = require("./../../../../models/user/User");

const {
  create_trusted_email_verification_token,
  verify_trusted_email_verification_token,
} = require("./../../../../helpers/tokens/trustedEmail");

const sendEmail = require("./../../../../helpers/createSendEmail");

const {
  disableTrustedEmail_DELETE_validation,
  sendEmail_during_recovery_POST_validation,
  verify_during_recovery_GET_validation
} = require("./../../../../validations/auth/recovery/trusted_email/trusted_email.validations");

//===========================================================================
// (2) Send an email to a previously trusted assigned email

// (1) send trusted email Page (GET)
const generateTrustedEmail_GET_service = async ({ req, res, next }) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get user form DB
  const user = await User.findById(userId).select({
    "account.recovery.methodTwo": 1,
  });

  // (3) Check feature status
  const is_trusted_email_enabled = user.account.recovery.methodTwo.is_enabled;

  if (is_trusted_email_enabled) {
    // If this feature is enabled. Then,

    // Show him his trusted email
    const trusted_email = user.account.recovery.methodTwo.email.value;
    return res.status(200).json({
      name: "Success",
      recovery_method: {
        is_enabled: is_trusted_email_enabled,
        trusted_email,
      },
    });
  } else {
    // If this feature is disabled. then,

    const is_temp_value_found =
      user.account.recovery.methodTwo.email.temp_value;

    // (1) If disabled. But, he has a temp email. Then,
    if (is_temp_value_found) {
      return res.status(200).json({
        name: "Success",
        recovery_method: {
          is_enabled: is_trusted_email_enabled,
          temporary_email: is_temp_value_found,
          message:
            "You need to verify this temporary email. Please check it's mailbox.",
        },
      });
    } else {
      // (2) If it's disabled and he doesn't have a temp email. Then,
      return res.status(200).json({
        name: "Success",
        recovery_method: {
          is_enabled: is_trusted_email_enabled,
          message:
            "This feature is disabled. If you want to enable it, type your trusted email and click verify button.",
        },
      });
    }
  }
};

// (2) Generate token and send it in an email to the given email (POST)
const generateTrustedEmail_POST_service = async ({ req, res, next }) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get trusted email from request
  const { email } = req.body;

  // If email not found
  if (!email) {
    return res.status(404).json({
      name: "Trusted Email Not Found",
      description: "Sorry, we can't find the trusted email in the request.",
    });
  }

  // (3) Get user form DB
  const user = await User.findById(userId).select({
    "account.recovery.methodTwo": 1,
    "account.email": 1,
  });

  // (4) Check if he/ she  is already assigned a temporary email
  const is_temp_value_found = user.account.recovery.methodTwo.email.temp_value;

  // If he has one
  if (is_temp_value_found) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "You already have a temporary email. Please, check your mail box to verify it.",
    });
  }

  // (5) If no change in trusted email
  const userTrustedEmail = user.account.recovery.methodTwo.email.value;

  // No change happened
  if (userTrustedEmail === email) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Your given email is exactly as our saved one.",
    });
  }

  // (6) Check if the given trusted email is same as his primary email
  const primary_email = user.account.email.value;

  if (primary_email === userTrustedEmail) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Your primary and trusted email can't be the same!",
    });
  }

  // If everything is okay. Then,

  // (5) Generate a token for trusted email verification
  const token = await create_trusted_email_verification_token(user.id);

  // (6) Update user document
  user.account.recovery.methodTwo.email.verification_token = token;
  user.account.recovery.methodTwo.email.temp_value = email;
  user.account.recovery.methodTwo.email.is_verified = false;
  if (user.account.recovery.methodTwo.email.value) {
    user.account.recovery.methodTwo.is_enabled = false;
  }

  // (7) Save user in DB
  await user.save();

  // (8) Setup email
  const verificationUrl = `${req.protocol}://${process.env.HOST}:${process.env.PORT}/api/v1/auth/account-recovery/trusted-email/verify/${token}`;
  const message = `Click to verify your email, ${verificationUrl}, you only have ${process.env.TRUSTED_EMAIL_VERIFICATION_TOKEN_SECRET_EXPIRES_IN}`;

  // (9) Send email
  // TODO: await sendEmail({
  //   email,
  //   subject: "Trusted Email verification link",
  //   message,
  // });
  console.log("Verification url: ", verificationUrl);

  // (10) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description: "Please, check the mail box of the given trusted email",
  });
};

// (3) verify and enable (GET)
const disableTrustedEmail_DELETE_service = async ({ req, res, next }) => {
  // (1) Get token from request
  const { token } = disableTrustedEmail_DELETE_validation({ req, res, next });

  // (2) Check if token is valid and not expired
  const decodedTrustedEmailToken =
    await verify_trusted_email_verification_token(token).catch(
      // Errors in token verification:
      (error) => {
        //  (1) If token is manipulated
        if (error.toString().includes("invalid signature")) {
          return res.status(422).json({
            name: "Invalid Token",
            description: "Sorry, your token is manipulated!!",
          });
        }

        // (2) if token is expired
        return res.status(401).json({
          name: "Invalid Token",
          description:
            "Sorry, your token is already expired. Please, click the resend button to receive a new email with an active link!",
        });
      }
    );

  // (2) Get user from DB
  const user = await User.findById(decodedTrustedEmailToken._id).select({
    "account.recovery.methodTwo": 1,
  });

  // If user is not found
  if (!user) {
    return res.status(404).json({
      name: "User Not Found",
      description: "Sorry, we can't find the user associated to this ID.",
    });
  }

  // (3) If this method is already enabled
  const is_trusted_email_enabled = user.account.recovery.methodTwo.is_enabled;
  const is_temp_value_found = user.account.recovery.methodTwo.email.temp_value;

  // If its' already enabled
  if (is_trusted_email_enabled && is_temp_value_found === undefined) {
    return res.status(400).json({
      name: "Bad Request",
      description: "This feature (Trusted email) is already enabled.",
    });
  }

  // (4) Check if user has his verification token
  const is_verification_token_match =
    user.account.recovery.methodTwo.email.verification_token === token;

  // If there is a match
  if (!is_verification_token_match) {
    return res.status(422).json({
      name: "Invalid token",
      description: "The given token doesn't match with our user assigned token",
    });
  }

  // If everything is okay. Then,

  // (5) Assign the given trusted email
  const trustedEmail = user.account.recovery.methodTwo.email.temp_value;

  // (6) Delete some properties from user document

  user.account.recovery.methodTwo.email.verification_token = undefined;
  user.account.recovery.methodTwo.email.temp_value = undefined;

  // (7) Update som properties in user document
  user.account.recovery.methodTwo.is_enabled = true;
  user.account.recovery.methodTwo.email.value = trustedEmail;
  user.account.recovery.methodTwo.email.is_verified = true;
  user.account.recovery.methodTwo.email.is_verified_at = Date.now();

  // (8) Save user in DB
  await user.save();

  // (9) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    url: req.url,
    description:
      "Congrats, you have enabled this account recovery method (Trusted email) successfully.",
    user,
  });
};

// (4) Disable (DELETE)
const verifyEnableTrustedEmail_GET_service = async ({ req, res, next }) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.recovery.methodTwo": 1,
  });

  // (3) Check if feature is already disabled
  const is_trusted_email_enabled = user.account.recovery.methodTwo.is_enabled;

  // If already disabled
  if (!is_trusted_email_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description: "This feature (Trusted Email) is already disabled",
    });
  }

  // If everything is okay. then,

  // (4) Update user document
  user.account.recovery.methodTwo.is_enabled = false;
  user.account.recovery.methodTwo.email = undefined;

  // (5) Save user document
  await user.save();

  // (6) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "You disabled the trusted email feature successfully. (Keep in mind that you made your account less secure now)",
  });
};

// During login
// (5) Send email (GET)
const sendEmail_during_recovery_GET_service = async ({ req, res, next }) => {
  res.status(200).json({
    name: "Success",
    message:
      "Please, type your primary email and click send to send recovery email to your trusted email mailbox.",
  });
};

// (6)  Send email (POST)
const sendEmail_during_recovery_POST_servicer = async ({ req, res, next }) => {
  // (1) Get user primary email from request
  const { email } = sendEmail_during_recovery_POST_validation({
    req,
    res,
    next,
  });

  // (2) Get user from DB
  const user = await User.findOne({
    "account.email.value": email,
  }).select({ "account.recovery.methodTwo": 1 });

  // If user not found. This means he doesn't have a trusted email
  if (!user) {
    return res.status(200).json({
      name: "Success",
      description:
        "Please, Check your trusted email mailbox for recovery link.",
    });
  }

  // (3) Generate a token for trusted email verification
  const recovery_token = await create_trusted_email_verification_token(user.id);

  // (4) Update user document
  user.account.recovery.methodTwo.recovery_token = recovery_token;

  // (5) Save user document
  await user.save();

  // (6) Setup email
  const recoveryUrl = `${req.protocol}://${process.env.HOST}:${process.env.PORT}/api/v1/auth//account-recovery/trusted-email/verify-during-recovery/${recovery_token}`;
  const message = `Hello, there. \nClick to recover your account, ${recoveryUrl}, you only have ${process.env.TRUSTED_EMAIL_VERIFICATION_TOKEN_SECRET_EXPIRES_IN}`;

  // (7) Send email
  // TODO: await sendEmail({
  //   email,
  //   subject: "Trusted Email verification link",
  //   message,
  // });
  console.log("Verification url: ", recoveryUrl);

  //(8) Inform frontend with the status.
  res.status(200).json({
    name: "Success",
    description: "Email sent to your trusted email mailbox successfully",
    user,
  });
};

// (7) verify token sent over email (GET)
const verify_during_recovery_GET_service = async ({ req, res, next }) => {
  // (1) Get token from request parameters
  const { token } = verify_during_recovery_GET_validation({ req, res, next });

  // (2) Decode the token
  const decoded_token = await verify_trusted_email_verification_token(
    token
  ).catch(
    // If there is error
    (error) => {
      //  (1) If token is manipulated
      if (error.toString().includes("invalid signature")) {
        return res.status(422).json({
          name: "Invalid Token",
          description: "Sorry, your token is manipulated!!",
        });
      }

      // (2) if token is expired
      return res.status(401).json({
        name: "Invalid Token",
        description:
          "Sorry, your token is already expired. Please, click the resend button to receive a new email with an active link!",
      });
    }
  );

  // (3) Get user from DB
  const user = await User.findById(decoded_token._id).select({
    "account.recovery.methodTwo": 1,
    "account.session": 1,
  });

  // If user is not found
  if (!user) {
    return res.status(404).json({
      name: "User Not Found",
      description: "Sorry, we can't find the token associated with this token.",
    });
  }

  // If everything is okay. Then,

  // (4) Update user document
  user.account.recovery.methodTwo.recovery_token = undefined;
  user.account.recovery.methodTwo.last_recovered_at = Date.now();

  // (5) Save user document
  await user.save();

  // (6) Give user access to our private resources. So he can change his security measures as he want.
  await giveAccess({ user, req, res });
};

//===========================================================================

module.exports = {
  generateTrustedEmail_GET_service,
  generateTrustedEmail_POST_service,
  disableTrustedEmail_DELETE_service,
  verifyEnableTrustedEmail_GET_service,
  sendEmail_during_recovery_GET_service,
  sendEmail_during_recovery_POST_servicer,
  verify_during_recovery_GET_service,
};
