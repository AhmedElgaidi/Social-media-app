const express = require("express");

// Import our controllers
const authControllers = require("../controllers/auth.controllers");
const protect = require("../middlewares/protect");
const getDeviceInfo = require("../middlewares/getDeviceInfo");
const is_account_active = require("../middlewares/isAccountActive");
const {
  AuthCallsIpAccessControlListMappingContext,
} = require("twilio/lib/rest/api/v2010/account/sip/domain/authTypes/authCallsMapping/authCallsIpAccessControlListMapping");
//======================================

// Let's create our express router instance
const router = express.Router();

//=======================================

// My Routes
router
  .route("/signup")
  .get(authControllers.signUp_GET)
  .post(authControllers.signUp_POST);

router
  .route("/login")
  .get(authControllers.login_GET)
  .post(
    getDeviceInfo,
    authControllers.login_POST,
    // authControllers.generateSendOTP,
    // authControllers.generateSendSMS_POST
  );

router.route("/verify-email/:token").post(authControllers.verifyAccount_POST);

router
  .route("/write-query")
  .get(
    protect,
    is_account_active,
    getDeviceInfo,
    authControllers.writeQuery_GET
  )
  .post(authControllers.writeQuery_POST);

router.route("/refresh").post(getDeviceInfo, authControllers.refreshToken_POST);

router
  .route("/sessions")
  .get(protect, is_account_active, authControllers.sessions_GET);
router
  .route("/delete-session")
  .delete(protect, is_account_active, authControllers.revokeSession_DELETE);
router
  .route("/logout")
  .delete(protect, is_account_active, authControllers.logout_DELETE);

router
  .route("/activate-account/:token")
  .post(authControllers.activateAccount_POST);
router
  .route("/deactivate-account")
  .post(protect, is_account_active, authControllers.deactivateAccount_POST);
router
  .route("/delete-account")
  .delete(protect, is_account_active, authControllers.deleteAccount_DELETE);

router
  .route("/change-password")
  .post(protect, is_account_active, authControllers.changePassword_POST);

router
  .route("/forget-password")
  .get(authControllers.forgetPassword_GET)
  .post(authControllers.forgetPassword_POST);

router
  .route("/reset-password/:token/:userId")
  .post(authControllers.resetPassword_POST)
  .get(authControllers.resetPassword_GET);

router
  .route("/2fa")
  .get(
    protect,
    is_account_active,
    authControllers.allTwoFactorAuthenticationMethods_GET
  );

// TOTP
router
  .route("/2fa/totp")
  .post(protect, is_account_active, authControllers.generateSecretTOTP_POST)
  .delete(protect, is_account_active, authControllers.disableTOTP_DELETE);

router
  .route("/2fa/totp/verify")
  .get(protect, is_account_active, authControllers.totpVerify_GET)
  .post(
    protect,
    is_account_active,
    authControllers.verifyTOTP_during_setup_POST
  );

router.route("/totp/verify").post(authControllers.verifyTOTP_during_login_POST);

// OTP
router
  .route("/2fa/otp")
  .get(protect, is_account_active, authControllers.otpPage_during_setup_GET)
  .post(protect, is_account_active, authControllers.enableOTP_POST)
  .delete(protect, is_account_active, authControllers.disableOTP_DELETE);

router
  .route("/2fa/otp/verify")
  .get(authControllers.otpPage_during_verifying_GET)
  .post(authControllers.verifyOTP_POST);

router.route("/2fa/otp/resend").post(authControllers.re_generate_send_OTP_POST);

// SMS
router
  .route("/2fa/sms")
  .get(protect, is_account_active, authControllers.smsPage_during_setup_GET)
  .post(protect, is_account_active, authControllers.generateSendSMS_POST)
  .delete(protect, is_account_active, authControllers.disableSMS_DELETE);

router
  .route("/2fa/sms/verify")
  .get(protect, is_account_active, authControllers.smsPage_GET)
  .post(protect, is_account_active, authControllers.verifySMS_POST);

//=======================================

// Export my router instance

module.exports = router;
