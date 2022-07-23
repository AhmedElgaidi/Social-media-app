const express = require("express");

const protect = require("./../../../../middlewares/protect");

const is_account_active = require("./../../../../middlewares/isAccountActive");

const {
  // During setup:
  enable_question_GET_controller,
  enable_question_POST_controller,
  change_question_PUT_controller,
  disable_question_DELETE_controller,

  // During login
  verify_question_during_login_GET_controller,
  verify_question_during_login_POST_controller,
} = require("./../../../../controllers/auth/security_layers/question/question.controllers");

//========================================

const router = express.Router();

// Security Question
router
  .route("/security-question")
  .get(protect, is_account_active, enable_question_GET_controller)
  .post(protect, is_account_active, enable_question_POST_controller)
  .put(protect, is_account_active, change_question_PUT_controller)
  .delete(protect, is_account_active, disable_question_DELETE_controller);

router
  .route("/security-question/verify")
  .get(verify_question_during_login_GET_controller)
  .post(verify_question_during_login_POST_controller);

module.exports = router;
