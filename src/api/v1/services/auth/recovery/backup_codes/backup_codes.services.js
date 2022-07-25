const User = require("./../../../../models/user/User");

const {
  generateArrayOfRandom12DigitsAndChars,
  hashBackupCodes,
  is_given_backup_code_found,
} = require("./../../../../helpers/backupCodes");

const {
  confirmBackupCodes_GET_validation,
  confirmBackupCodes_POST_validation,
  regenerateBackupCodes_POST_validation,
  verifyBackupCodes_POST_validation
} = require("./../../../../validations/auth/recovery/backup_codes/backup_codes.validations");

//====================================================================
// Recovery options

// (1) Account backup codes (Recover option one)
// (1) Get user assigned and saved backup codes (GET)
const showBackupCodes_GET_service = async ({ req, res, next }) => {
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
const generateBackupCodes_POST_service = async ({ req, res, next }) => {
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
const disableBackupCodes_DELETE_service = async ({ req, res, next }) => {
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
const confirmBackupCodes_GET_service = async ({ req, res, next }) => {
  // (1) Get userId from previous middleware
  const { userId } = confirmBackupCodes_GET_validation({ req, res, next });

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
const confirmBackupCodes_POST_service = async ({ req, res, next }) => {
  // (1) Get userId from previous middleware
  const { userId } = confirmBackupCodes_POST_validation({ req, res, next });

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
const regenerateBackupCodes_GET_service = ({ req, res, next }) => {
  res.status(200).json({
    url: req.url,
    description:
      "The page with a regenerate button to click. Used in two cases (If you want to change the backup codes for any reason (Compromised, lost, etc...) + There is no more valid codes remaining and you need to generate new group of codes to guarantee your future login attempts).",
  });
};

// (7) Regenerate backup codes (POST)
const regenerateBackupCodes_POST_service = async ({ req, res, next }) => {
  // (1) Get userId from request
  const { userId } = regenerateBackupCodes_POST_validation({ req, res, next });

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
const verifyBackupCodes_GET_service = ({ req, res, next }) => {
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
const verifyBackupCodes_POST_service = async ({ req, res, next }) => {
  // (1) Get userId and code from request
  const { userId, code } = verifyBackupCodes_POST_validation({
    req,
    res,
    next,
  });

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

//====================================================================

module.exports = {
  showBackupCodes_GET_service,
  generateBackupCodes_POST_service,
  disableBackupCodes_DELETE_service,
  confirmBackupCodes_GET_service,
  confirmBackupCodes_POST_service,
  regenerateBackupCodes_GET_service,
  regenerateBackupCodes_POST_service,
  verifyBackupCodes_GET_service,
  verifyBackupCodes_POST_service,
};
