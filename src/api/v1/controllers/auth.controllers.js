const writeQuery_GET = async (req, res, next) => {
  await User.find().then((users) => res.send(users));
};
const writeQuery_POST = async (req, res, next) => {
  res.send("Consider it a private resource!");
};













// method (4): Security Question
// (1)
const enable_security_question_GET = (req, res, next) => {
  res.send(
    "The page where the user sends from it his security question and answer."
  );
};

// (2)
const enable_security_question_POST = async (req, res, next) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get the given params from request
  const { question, answer, hint } = req.body;

  // If one of them is not found
  if (!(question || answer || hint)) {
    return res.status(404).json({
      name: "Invalid Input",
      description:
        "You need to send the 'question, answer and hint' in order to proceed.",
    });
  }

  // (3) Get user from DB
  const user = await User.findById(userId).select({
    "account.two_fa.question": 1,
  });

  // (4) Check if this feature is already enabled
  const is_question_enabled = user.account.two_fa.question.is_enabled;

  // If it's already enabled
  if (is_question_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "This 2fa method (Security Question) is already enabled in your account",
    });
  }

  // If everything is okay. Then,

  // (5) Update user document
  user.account.two_fa.question.value = question;
  user.account.two_fa.question.answer = answer;
  user.account.two_fa.question.hint = hint;
  user.account.two_fa.question.is_enabled = true;

  // (6) Save user document
  await user.save();

  // (7) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "You enabled a 'security question' as a 2fa method successfully.",
  });
};

// (3)
const change_security_question_PUT = async (req, res, next) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get the given params from request
  const { question, answer, hint } = req.body;

  // If one of them is not found
  if (!(question || answer || hint)) {
    return res.status(404).json({
      name: "Invalid Input",
      description:
        "You need to send the 'question, answer and hint' in order to proceed.",
    });
  }

  // (3) Get user from DB
  const user = await User.findById(userId).select({
    "account.two_fa.question": 1,
  });

  // (4) If This feature is disabled
  const is_question_enabled = user.account.two_fa.question.is_enabled;

  // if disabled
  if (!is_question_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "You can't change the security question's data if it's not already enabled!!!",
    });
  }

  // (5) Check if there is no modification happened (To reduce database server load!)
  if (
    !(
      user.account.two_fa.question.value !== question ||
      user.account.two_fa.question.answer !== answer ||
      user.account.two_fa.question.hint !== hint
    )
  ) {
    return res.status(400).json({
      name: "Bad Request",
      description: "You actually didn't make in modification in the data!",
    });
  }

  // If everything is okay. Then,

  // (6) Update user document
  user.account.two_fa.question.value = question;
  user.account.two_fa.question.answer = answer;
  user.account.two_fa.question.hint = hint;

  // (7) Save user document
  await user.save();

  // (8) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "Congrats, you changed your security question data successfully.",
  });
};

// (4)
const disable_security_question_DELETE = async (req, res, next) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.two_fa.question": 1,
  });

  // (3) check if it's already disabled
  const is_enabled = user.account.two_fa.question.is_enabled;

  // if disabled
  if (!is_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "Sorry, this feature (security question) is already not enabled!!!",
    });
  }

  // If everything is okay. Then,

  // (4) Update user document
  user.account.two_fa.question.value = undefined;
  user.account.two_fa.question.answer = undefined;
  user.account.two_fa.question.hint = undefined;
  user.account.two_fa.question.is_enabled = false;

  // (5) Save user document
  await user.save();

  // (6) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "Congrats, you disabled this 2fa method (Security Question). You now are less secure!!",
  });
};

// (5)
const verify_security_question_during_login_GET = (req, res, next) => {
  res.status(200).json({
    url: req.url,
    description:
      "The page where the user sees the security question and the hint and sends us his answer for identity verification.",
  });
};

// (6)
const verify_security_question_during_login_POST = async (req, res, next) => {
  // (1) Get userId and answer from request
  const { userId, answer } = req.body;

  // If user ID is not found
  if (!userId) {
    return res.status(404).json({
      name: "Id Not Found",
      description: "Sorry, we can't find the ID in the request",
    });
  }

  // If answer is not found
  if (!answer) {
    return res.status(404).json({
      name: "Answer Not Found",
      description:
        "Sorry, we can't find the answer to the security question in the request",
    });
  }

  // (2) Get user document from DB
  const user = await User.findById(userId).select({
    "account.two_fa.question": 1,
    "account.session": 1,
  });

  // (3) If user didn't actually enable this feature in his account
  if (!user.account.two_fa.question.is_enabled) {
    return res.status(401).json({
      name: "Authentication failed",
      description: "log in attempt was unsuccessful.",
    });
  }

  // (4) if answer didn't match
  const is_match = user.account.two_fa.question.answer === answer;

  // If not
  if (!is_match) {
    return res.status(401).json({
      name: "Authentication failed",
      description:
        "log in attempt was unsuccessful. Please follow your hint to make your login attempt successful.",
    });
  }

  // If everything is okay. Then,

  //(6) Give user access to our private resources
  await giveAccess({ user, req, res });
};

//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
// Recovery options

// (1) Account backup codes (Recover option one)

// (1) Get user assigned and saved backup codes (GET)
const showBackupCodes_GET = async (req, res, next) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.recovery.methodOne": 1,
  });

  // (3) Check if this feature is enabled
  const is_backup_enabled = user.account.recovery.methodOne.is_enabled;

  // If not enabled
  if (!is_backup_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "Sorry, this feature (Account recovery option) is not enabled in your account!",
    });
  }

  // (4) Inform frontend with the status
  res.status(200).json({
    url: req.url,
    user: user.account.recovery.methodOne.codes.map(
      // to send only data about codes (used or not)
      (code, i) =>
        (code = {
          code: i + 1,
          is_used: code.is_used,
          is_used_at: code.is_used_at,
        })
    ),
  });
};

// (2) Generate and show backup codes (POST) save as temp_code
const generateBackupCodes_POST = async (req, res, next) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.recovery.methodOne": 1,
    "account.two_fa": 1,
  });

  // (3) Check if user has at least two 2fa methods enabled
  let count = 0;
  if (user.account.two_fa.totp.is_enabled) count += 1;
  if (user.account.two_fa.otp.is_enabled) count += 1;
  if (user.account.two_fa.sms.is_enabled) count += 1;
  if (user.account.two_fa.question.is_enabled) count += 1;

  // If there are less than 2 methods enabled, then don't allow him to enable account recovery
  if (count < 2) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "Sorry, you can't enable the account recovery methods unless you have at least two 2fa methods enabled.",
    });
  }

  // (4) Check if user has temp_codes
  const is_temp_codes_found = user.account.recovery.methodOne.temp_codes.length;

  // If they are found
  if (is_temp_codes_found > 1) {
    return res.status(400).json({
      name: "Bad Request",
      description: "You already have a temporary backup codes!!",
    });
  }

  // (5) Check if codes already created
  const are_codes_found = user.account.recovery.methodOne.codes.length;

  // If codes found
  if (are_codes_found >= 1) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "Sorry, you can't generate new codes if you already have ones. (If you want to regenerate, then check the regenerate endpoint)",
    });
  }

  // If everything is okay. Then,

  // (5) Generate temp_codes
  const temp_codes = await generateArrayOfRandom12DigitsAndChars();

  // (6) Update user document
  user.account.recovery.methodOne.temp_codes = temp_codes;

  // (7) Save user document
  await user.save();

  // (8) Redirect him to page so, he can see his generated temp_codes and confirm them
  res
    .status(301)
    .redirect(
      `/api/v1/auth/account-recovery/backup-codes/confirm/?userId=${user.id}`
    );
};

// (3) Disable backup code (DELETE)
const disableBackupCodes_DELETE = async (req, res, next) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.recovery.methodOne": 1,
  });

  // (3) Check if it's already disabled
  const is_backup_enabled = user.account.recovery.methodOne.is_enabled;

  // If its' disabled
  if (!is_backup_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description: "Sorry, you already disabled this feature (Backup codes).",
    });
  }

  // If everything is okay. then,

  // (4) update user document
  user.account.recovery.methodOne.is_enabled = false;
  user.account.recovery.methodOne.codes = undefined;
  user.account.recovery.methodOne.temp_codes = undefined;
  user.account.recovery.methodOne.changed_at = undefined;

  // (5) Save user document
  await user.save();

  // (6) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "Congrats, you disabled Backup codes feature (Note: You can't access your account now if something wrong goes with your 2fa methods!!(No backup plan anymore)).",
  });
};

// (4) Confirm backup codes (GET)
const confirmBackupCodes_GET = async (req, res, next) => {
  // (1) Get userId from previous middleware
  const { userId } = req.query;

  // If userId not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "Sorry, we can't find the ID in the request parameters",
    });
  }

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.recovery.methodOne": 1,
  });
  // .catch(err => res.send(err));

  // If user not found
  if (!user) {
    return res.status(404).json({
      name: "User Not Found",
      description: "Sorry, we can't find the user associated to this ID.",
    });
  }

  // (3) Check if user has temp_codes
  const is_temp_codes_length =
    user.account.recovery.methodOne.temp_codes.length;

  // if not found
  if (is_temp_codes_length < 1) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "You haven't asked for backup codes generation. How do you want to confirm it!!!",
    });
  }

  res.json({
    url: req.url,
    generated_codes: user.account.recovery.methodOne.temp_codes,
  });
};

// (5) Confirm and save backup codes (POST)
const confirmBackupCodes_POST = async (req, res, next) => {
  // (1) Get userId from previous middleware
  const { userId } = req.body || req.query;

  // If userId not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "Sorry, we can't find the ID in the request. bla bla bla",
    });
  }

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.recovery.methodOne": 1,
  });

  // If user not found
  if (!user) {
    return res.status(404).json({
      name: "User Not Found",
      description: "Sorry, we can't find the user associated to this ID.",
    });
  }

  // (3) If this feature is enabled
  const is_backup_enabled = user.account.recovery.methodOne.is_enabled;

  // If it's enabled
  if (is_backup_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "Sorry, This feature (Backup Codes) is already enabled in your account",
    });
  }

  // (4) Check if user hasn't temp_codes
  const is_temp_codes_length =
    user.account.recovery.methodOne.temp_codes.length;

  // if not found
  if (is_temp_codes_length < 1) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "You haven't asked for backup codes generation. How do you want to confirm it!!!",
    });
  }

  // If everything is okay. Then,

  // (5) Hash the temp codes
  const temp_codes = user.account.recovery.methodOne.temp_codes;
  const hashedCodes = await hashBackupCodes(temp_codes);

  // (6) Update user document
  user.account.recovery.methodOne.codes = hashedCodes;
  user.account.recovery.methodOne.temp_codes = undefined;
  user.account.recovery.methodOne.is_enabled = true;

  // (7) Save user document
  await user.save();

  // (8) Inform frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "congrats, you enabled the account backup codes successfully. Now, if you have any problem with the 2FA you can use any one of given backup codes to get access to your account.",
  });
};

// (6) Regenerate backup codes (GET)
const regenerateBackupCodes_GET = (req, res, next) => {
  res.status(200).json({
    url: req.url,
    description:
      "The page with a regenerate button to click. Used in two cases (If you want to change the backup codes for any reason (Compromised, lost, etc...) + There is no more valid codes remaining and you need to generate new group of codes to guarantee your future login attempts).",
  });
};

// (7) Regenerate backup codes (POST)
const regenerateBackupCodes_POST = async (req, res, next) => {
  // (1) Get userId from request
  const { userId } = req.body || req.query;

  // If userId not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "Sorry, we can't find the ID in the request.ds",
    });
  }

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.recovery.methodOne": 1,
  });

  // If user not found
  if (!user) {
    return res.status(404).json({
      name: "User Not Found",
      description: "Sorry, we can't find the user associated to this ID.",
    });
  }

  // (3) Check if this feature is disabled
  const is_backup_enabled = user.account.recovery.methodOne.is_enabled;

  // If disabled
  if (!is_backup_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "Sorry, you can't regenerate a new backup codes when this feature is already disabled.",
    });
  }

  // If everything is okay. Then,

  // (4) Generate new temp_codes
  const temp_codes = await generateArrayOfRandom12DigitsAndChars();

  // (5) Update user document
  user.account.recovery.methodOne.codes = undefined;
  user.account.recovery.methodOne.temp_codes = temp_codes;
  user.account.recovery.methodOne.is_enabled = false;

  // (6) Save user document
  await user.save();

  // (7) Redirect him to the confirm code endpoint
  res
    .status(301)
    .redirect(
      `/api/v1/auth/account-recovery/backup-codes/confirm?userId=${user.id}`
    );
};

// (8) Verify backup codes (GET)
const verifyBackupCodes_GET = (req, res, next) => {
  res.status(200).json({
    url: req.url,
    description:
      "The page where you enter one of the previously given backup codes. So, you can have access and recover your account.",
  });
};

// @route POST api/bla/bla
// @desc Verify backup code
// @access

// (9) Verify backup codes (POST)
const verifyBackupCodes_POST = async (req, res, next) => {
  // (1) Get userId and code from request
  const { userId, code } = req.body;

  // If userId not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "Sorry, we can't find the ID in the request.",
    });
  }

  // If code not found
  if (!code) {
    return res.status(404).json({
      name: "Code Not Found",
      description: "Sorry, we can't find the backup code in the request.",
    });
  }

  // IF code length isn't correct
  if (code.length != 12) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Sorry, the code length can't be true!",
    });
  }

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.recovery.methodOne": 1,
    "account.two_fa": 1,
    "account.session": 1,
  });

  // If user not found
  if (!user) {
    return res.status(404).json({
      name: "User Not Found",
      description: "Sorry, we can't find a user associated with the given ID.",
    });
  }

  // (3) Check if this feature is enabled
  const is_backup_enabled = user.account.recovery.methodOne.is_enabled;

  // If disabled
  if (!is_backup_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "You can't use this endpoint because you aren't enabling the backup codes feature.",
    });
  }

  // (4) Check given code against our saved backup codes
  const backup_codes = user.account.recovery.methodOne.codes;

  const { value: is_given_code_found, index: given_code_index } =
    is_given_backup_code_found(code, backup_codes);

  // If given code doesn't found
  if (!is_given_code_found) {
    return res.status(422).json({
      name: "Invalid Code",
      description: "Sorry, the given code doesn't match with our saved codes.",
    });
  }

  // If given code is true but already used
  const is_code_used =
    user.account.recovery.methodOne.codes[given_code_index].is_used;

  // If it's used
  if (is_code_used) {
    return res.status(422).json({
      name: "Invalid Code",
      description: "Sorry, this given code is already used before.",
    });
  }

  // (5) Mark the given code as used code
  user.account.recovery.methodOne.codes[given_code_index].is_used = true;
  user.account.recovery.methodOne.codes[given_code_index].is_used_at =
    Date.now();

  // (6) Save user document
  await user.save();

  // (7) Check the count of unused codes
  const countOfUnusedCodes = [
    // Here, i'm using spread operator to convert object to array. So, i can count it.
    ...user.account.recovery.methodOne.codes.filter(
      (code) => code.is_used == false
    ),
  ].length;

  // If it was 0 (It means he/ she needs to generate new set of codes). So, we redirect him
  if (countOfUnusedCodes == 0) {
    return res
      .status(301)
      .redirect("/api/v1/auth/account-recovery/backup-codes/regenerate");
  }

  // (8) Give user access to our private resources
  await giveAccess({ user, req, res });
};

//-----------------------------------------------------------------------------------------

// (2) Send an email to a previously trusted assigned email

// (1) send trusted email Page (GET)
const generateTrustedEmail_GET = async (req, res, next) => {
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
const generateTrustedEmail_POST = async (req, res, next) => {
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
const verifyEnableTrustedEmail_GET = async (req, res, next) => {
  // (1) Get token from request
  const { token } = req.params;

  // If token is not found
  if (!token) {
    return res.status(404).json({
      name: "Token Not Found",
      description:
        "Sorry, we can't find the verification token in the request.",
    });
  }

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
const disableTrustedEmail_DELETE = async (req, res, next) => {
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
const sendEmailToTrustedEmail_during_recovery_GET = (req, res, next) => {
  res.status(200).json({
    name: "Success",
    message:
      "Please, type your primary email and click send to send recovery email to your trusted email mailbox.",
  });
};

// (6)  Send email (POST)
const sendEmailToTrustedEmail_during_recovery_POST = async (req, res, next) => {
  // (1) Get user primary email from request
  const { email } = req.body;

  // If not found
  if (!email) {
    return res.status(404).json({
      name: "Email Not Found",
      description: "Sorry, we can't find the email in the request.",
    });
  }

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
const verifyTrustedEmail_during_recovery_GET = async (req, res, next) => {
  // (1) Get token from request parameters
  const { token } = req.params;

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
    "account.session": 1
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
  scanTOTP_qrCode_GET,
  verifyTOTP_during_setup_POST,
  verifyTOTP_during_login_GET,
  verifyTOTP_during_login_POST,
  totpVerify_GET,
  disableTOTP_DELETE,
  disableOTP_DELETE,
  generateSendOTP_GET,
  generateSendOTP_POST,
  verifyOTP_POST,
  otpPage_during_verifying_GET,
  re_generate_send_OTP_POST,
  smsPage_during_setup_GET,
  generateSendSMS_POST,
  verifySMS_duringSetup_GET,
  verifySMS_duringSetup_POST,
  disableSMS_DELETE,
  resendSMS_during_setup_POST,
  generateSendSMS_duringLogin_GET,
  generateSendSMS_duringLogin_POST,
  verifySMS_duringLogin_GET,
  verifySMS_duringLogin_POST,
  resendSMS_during_login_POST,
  enable_security_question_GET,
  enable_security_question_POST,
  change_security_question_PUT,
  disable_security_question_DELETE,
  verify_security_question_during_login_GET,
  verify_security_question_during_login_POST,
  showBackupCodes_GET,
  generateBackupCodes_POST,
  confirmBackupCodes_GET,
  confirmBackupCodes_POST,
  disableBackupCodes_DELETE,
  regenerateBackupCodes_GET,
  regenerateBackupCodes_POST,
  verifyBackupCodes_GET,
  verifyBackupCodes_POST,
  generateTrustedEmail_GET,
  generateTrustedEmail_POST,
  disableTrustedEmail_DELETE,
  verifyEnableTrustedEmail_GET,
  sendEmailToTrustedEmail_during_recovery_GET,
  sendEmailToTrustedEmail_during_recovery_POST,
  verifyTrustedEmail_during_recovery_GET,
};
