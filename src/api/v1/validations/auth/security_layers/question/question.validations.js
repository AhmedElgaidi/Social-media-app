const {
  disableOTP_DELETE_service,
  verifyOTP_GET_service,
} = require("../../../../services/auth/security_layers/otp/otp.services");
const {
    enable_question_GET_service,
    enable_question_POST_service,
    change_question_PUT_service,
    disable_question_DELETE_service,
    verify_question_during_login_GET_service,
    verify_question_during_login_POST_service,
} = require("../../../../services/auth/security_layers/question/question.services");

// =======================================================================
// During setup:
const enable_question_GET_controller = (req, res, next) => {
  enable_question_GET_service({ req, res, next });
};

const enable_question_POST_controller = async (req, res, next) => {
  await enable_question_POST_service({ req, res, next });
};

const change_question_PUT_controller = async (req, res, next) => {
  await change_question_PUT_service({ req, res, next });
};

const disable_question_DELETE_controller = async (req, res, next) => {
  await disable_question_DELETE_service({ req, res, next });
};

// During login:
const verify_question_during_login_GET_controller = (
  req,
  res,
  next
) => {
  verify_question_during_login_GET_service({ req, res, next });
};

const verify_question_during_login_POST_controller = async (
  req,
  res,
  next
) => {
  await verify_question_during_login_POST_service({ req, res, next });
};

module.exports = {
  // During setup:
  enable_question_GET_controller,
  enable_question_POST_controller,
  change_question_PUT_controller,
  disable_question_DELETE_controller,

  // During login
  verify_question_during_login_GET_controller,
  verify_question_during_login_POST_controller,
};
