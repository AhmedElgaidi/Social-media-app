const express = require("express");

const protect = require("./../../../../middlewares/protect");

const is_account_active = require("./../../../../middlewares/isAccountActive");

const {
  generateSendOTP_POST_controller,
  disableOTP_DELETE_controller,
  verifyOTP_GET_controller,
  verifyOTP_POST_controller,
  re_generate_send_OTP_POST_controller,
} = require("./../../../../controllers/auth/security_layers/otp/otp.controllers");

//========================================

const router = express.Router();

// Method (2): OTP
router
  .route("/otp")
  .post(protect, is_account_active, generateSendOTP_POST_controller)
  .delete(protect, is_account_active, disableOTP_DELETE_controller);

router
  .route("/otp/verify/:userId")
  .get(verifyOTP_GET_controller)
  .post(verifyOTP_POST_controller);

router.route("/otp/resend").post(re_generate_send_OTP_POST_controller);

module.exports = router;
