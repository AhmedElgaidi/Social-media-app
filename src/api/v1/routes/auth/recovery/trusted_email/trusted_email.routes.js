const express = require("express");

const protect = require("./../../../../middlewares/protect");

const is_account_active = require("./../../../../middlewares/isAccountActive");

const {
  generateTrustedEmail_GET_controller,
  generateTrustedEmail_POST_controller,
  disableTrustedEmail_DELETE_controller,
  verifyEnableTrustedEmail_GET_controller,
  sendEmail_during_recovery_GET_controller,
  sendEmail_during_recovery_POST_controller,
  verify_during_recovery_GET_controller,
} = require("./../../../../controllers/auth/recovery/trusted_email/trusted_email.controllers");

//========================================

const router = express.Router();

// Option (2)
router
  .route("/trusted-email")
  .get(protect, is_account_active, generateTrustedEmail_GET_controller)
  .post(protect, is_account_active, generateTrustedEmail_POST_controller)
  .delete(protect, is_account_active, disableTrustedEmail_DELETE_controller);

router
  .route("/trusted-email/verify/:token")
  .get(verifyEnableTrustedEmail_GET_controller);

// During Recovery
router
  .route("/trusted-email/send")
  .get(sendEmail_during_recovery_GET_controller)
  .post(sendEmail_during_recovery_POST_controller);

router
  .route("/trusted-email/verify-during-recovery/:token")
  .get(verify_during_recovery_GET_controller);

module.exports = router;
