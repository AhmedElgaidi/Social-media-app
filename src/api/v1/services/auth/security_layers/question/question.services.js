const User = require("./../../../../models/user/User");

const {
  enable_question_POST_validation,
  change_question_PUT_validation,
  verifySMS_duringLogin_POST_validation,
} = require("./../../../../validations/auth/security_layers/question/question.validations");

//=========================================================================
// method (4): Security Question
// During setup:
// (1)
const enable_question_GET_service = ({ req, res, next }) => {
  res.status(200).json({
    name: "Success",
    description:
      "The page where the user writes his his security question, answer and hint.",
  });
};

// (2)
const enable_question_POST_service = async ({ req, res, next }) => {
  // (1) Get user data from request
  const { userId, question, answer, hint } = enable_question_POST_validation({
    req,
    res,
    next,
  });

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
const change_question_PUT_service = async ({ req, res, next }) => {
  // (1) Get user data from request
  const { userId, question, answer, hint } = change_question_PUT_validation({
    req,
    res,
    next,
  });

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
const disable_question_DELETE_service = async ({ req, res, next }) => {
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

// During login:
// (5)
const verify_question_during_login_GET_service = async ({ req, res, next }) => {
  const user = await User.findById(req.params.userId).select({
    "account.two_fa.question": 1,
  });

  res.status(200).json({
    url: req.url,
    description:
      "The page where the user sees the security question and the hint and sends us his answer for identity verification.",
    question: user.account.two_fa.question.value,
    hint: user.account.two_fa.question.hint,
  });
};

const verify_question_during_login_POST_service = async ({
  req,
  res,
  next,
}) => {
  // (1) Get userId and answer from request
  const { userId, answer } = verify_question_during_login_POST_validation({
    req,
    res,
    next,
  });

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

//=========================================================================

module.exports = {
  enable_question_GET_service,
  enable_question_POST_service,
  change_question_PUT_service,
  disable_question_DELETE_service,
  verify_question_during_login_GET_service,
  verify_question_during_login_POST_service,
};
