const express = require("express");

// Import our controllers
const authControllers = require("../controllers/auth.controllers");
const protect = require("../middlewares/protect");
const getDeviceInfo = require("../middlewares/getDeviceInfo");
const is_account_active = require("../middlewares/isAccountActive");
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
  .post(getDeviceInfo, authControllers.login_POST);

router.route("/verify-email/:token").post(authControllers.verifyAccount_POST);

// Just for testing stuff
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

// Get all 2FA methods that user might enable
router
  .route("/2fa")
  .get(
    protect,
    is_account_active,
    authControllers.allTwoFactorAuthenticationMethods_GET
  );

// (1) TOTP
router
  .route("/2fa/totp")
  .post(protect, is_account_active, authControllers.generateSecretTOTP_POST)
  .delete(protect, is_account_active, authControllers.disableTOTP_DELETE);

router
  .route("/2fa/totp/scan/:qrcode")
  .get(protect, is_account_active, authControllers.scanTOTP_qrCode_GET);

router
  .route("/2fa/totp/verify")
  .get(protect, is_account_active, authControllers.totpVerify_GET)
  .post(
    protect,
    is_account_active,
    authControllers.verifyTOTP_during_setup_POST
  );

router
  .route("/totp/verify")
  .get(authControllers.verifyTOTP_during_login_GET)
  .post(authControllers.verifyTOTP_during_login_POST);

// OTP
router
  .route("/2fa/otp")
  .get(protect, is_account_active, authControllers.generateSendOTP_GET)
  .post(protect, is_account_active, authControllers.generateSendOTP_POST)
  .delete(protect, is_account_active, authControllers.disableOTP_DELETE);

router
  .route("/2fa/otp/verify")
  .get(authControllers.otpPage_during_verifying_GET)
  .post(authControllers.verifyOTP_POST);

router.route("/2fa/otp/resend").post(authControllers.re_generate_send_OTP_POST);

// SMS
router
  .route("/2fa/sms/setup")
  .get(protect, is_account_active, authControllers.smsPage_during_setup_GET)
  .post(protect, is_account_active, authControllers.generateSendSMS_POST)
  .delete(protect, is_account_active, authControllers.disableSMS_DELETE);

router
  .route("/2fa/sms/setup/verify")
  .get(protect, is_account_active, authControllers.verifySMS_duringSetup_GET)
  .post(protect, is_account_active, authControllers.verifySMS_duringSetup_POST);

router
  .route("/2fa/sms/setup/resend")
  .post(
    protect,
    is_account_active,
    authControllers.resendSMS_during_setup_POST
  );

// During login
router
  .route("/2fa/sms")
  .get(authControllers.generateSendSMS_duringLogin_GET)
  .post(authControllers.generateSendSMS_duringLogin_POST);

router
  .route("/2fa/sms/verify")
  .get(authControllers.verifySMS_duringLogin_GET)
  .post(authControllers.verifySMS_duringLogin_POST);

router
  .route("/2fa/sms/resend")
  .post(authControllers.resendSMS_during_login_POST);

// Security Question
router
  .route("/2fa/security-question")
  .get(protect, is_account_active, authControllers.enable_security_question_GET)
  .post(
    protect,
    is_account_active,
    authControllers.enable_security_question_POST
  )
  .put(protect, is_account_active, authControllers.change_security_question_PUT)
  .delete(
    protect,
    is_account_active,
    authControllers.disable_security_question_DELETE
  );

router
  .route("/2fa/security-question/verify")
  .get(authControllers.verify_security_question_during_login_GET)
  .post(authControllers.verify_security_question_during_login_POST);

//-----------------------------
// Account recover options
// Option (1)
router
  .route("/account-recovery/backup-codes")
  .get(protect, is_account_active, authControllers.showBackupCodes_GET)
  .post(protect, is_account_active, authControllers.generateBackupCodes_POST)
  .delete(
    protect,
    is_account_active,
    authControllers.disableBackupCodes_DELETE
  );

router
  .route("/account-recovery/backup-codes/confirm")
  .get(authControllers.confirmBackupCodes_GET)
  .post(authControllers.confirmBackupCodes_POST);

router
  .route("/account-recovery/backup-codes/regenerate")
  .get(authControllers.regenerateBackupCodes_GET)
  .post(authControllers.regenerateBackupCodes_POST);

router
  .route("/account-recovery/backup-codes/verify")
  .get(authControllers.verifyBackupCodes_GET)
  .post(authControllers.verifyBackupCodes_POST);

// Option (2)
router
  .route("/account-recovery/trusted-email")
  .get(protect, is_account_active, authControllers.generateTrustedEmail_GET)
  .post(protect, is_account_active, authControllers.generateTrustedEmail_POST)
  .delete(
    protect,
    is_account_active,
    authControllers.disableTrustedEmail_DELETE
  );

router
  .route("/account-recovery/trusted-email/verify/:token")
  .get(authControllers.verifyEnableTrustedEmail_GET);

// During Recovery
router
  .route("/account-recovery/trusted-email/send")
  .get(authControllers.sendEmailToTrustedEmail_during_recovery_GET)
  .post(authControllers.sendEmailToTrustedEmail_during_recovery_POST);

router
  .route("/account-recovery/trusted-email/verify-during-recovery/:token")
  .get(authControllers.verifyTrustedEmail_during_recovery_GET);

//=======================================

// Export my router instance

module.exports = router;
