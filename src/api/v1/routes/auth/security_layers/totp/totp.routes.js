const express = require("express");

const protect = require("./../../../../middlewares/protect");

const is_account_active = require("./../../../../middlewares/isAccountActive");

const {
  all2faMethods_GET_controller,
  generateSecretTOTP_POST_controller,
  disableTOTP_DELETE_controller,
  scanTOTP_qrCode_GET_controller,
  totpVerify_GET_controller,
  verifyTOTP_during_setup_POST_controller,
  verifyTOTP_during_login_GET_controller,
  verifyTOTP_during_login_POST_controller,
} = require("./../../../../controllers/auth/security_layers/totp/totp.controllers");

//========================================

const router = express.Router();

// Get all 2FA methods that user might enable
router.route("/methods").get(protect, is_account_active, all2faMethods_GET_controller);

router
  .route("/totp")
  .post(protect, is_account_active, generateSecretTOTP_POST_controller)
  .delete(protect, is_account_active, disableTOTP_DELETE_controller);

router
  .route("/totp/scan/:qrcode")
  .get(protect, is_account_active, scanTOTP_qrCode_GET_controller);

router
  .route("/totp/verify")
  .get(protect, is_account_active, totpVerify_GET_controller)
  .post(protect, is_account_active, verifyTOTP_during_setup_POST_controller);

router
  .route("/totp/verify-during-login/:userId")
  .get(verifyTOTP_during_login_GET_controller)
  .post(verifyTOTP_during_login_POST_controller);

module.exports = router;
