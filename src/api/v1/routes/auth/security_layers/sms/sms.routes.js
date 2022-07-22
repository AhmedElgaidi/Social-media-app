const express = require("express");

const protect = require("./../../../../middlewares/protect");

const is_account_active = require("./../../../../middlewares/isAccountActive");

const {
  smsPage_during_setup_GET_controller,
  generateSendSMS_POST_controller,
  disableSMS_DELETE_controller,
  verifySMS_duringSetup_GET_controller,
  verifySMS_duringSetup_POST_controller,
  resendSMS_during_setup_POST_controller,

  generateSendSMS_duringLogin_GET_controller,
  generateSendSMS_duringLogin_POST_controller,
  verifySMS_duringLogin_GET_controller,
  verifySMS_duringLogin_POST_controller,
  resendSMS_during_login_POST_controller,
} = require("./../../../../controllers/auth/security_layers/sms/sms.controllers");

//========================================

const router = express.Router();

// SMS
router
  .route("/sms/setup")
  .get(protect, is_account_active, smsPage_during_setup_GET_controller)
  .post(protect, is_account_active, generateSendSMS_POST_controller)
  .delete(protect, is_account_active, disableSMS_DELETE_controller);

router
  .route("/sms/setup/verify")
  .get(protect, is_account_active, verifySMS_duringSetup_GET_controller)
  .post(protect, is_account_active, verifySMS_duringSetup_POST_controller);

router
  .route("sms/setup/resend")
  .post(protect, is_account_active, resendSMS_during_setup_POST_controller);

//------------------------------------------------------------

// During login
router
  .route("/sms")
  .get(generateSendSMS_duringLogin_GET_controller)
  .post(generateSendSMS_duringLogin_POST_controller);

router
  .route("/sms/verify")
  .get(verifySMS_duringLogin_GET_controller)
  .post(verifySMS_duringLogin_POST_controller);

router.route("/sms/resend").post(resendSMS_during_login_POST_controller);

module.exports = router;
