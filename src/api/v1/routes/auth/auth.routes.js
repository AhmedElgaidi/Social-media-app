// const express = require("express");

// // Import our controllers
// const authControllers = require("../../controllers/auth.controllers");
// const protect = require("../../middlewares/protect");
// const getDeviceInfo = require("../../middlewares/getDeviceInfo");
// const is_account_active = require("../../middlewares/isAccountActive");
// //======================================

// // Let's create our express router instance
// const router = express.Router();

// //=======================================

// // My Routes

// // Just for testing stuff
// router
//   .route("/write-query")
//   .get(
//     protect,
//     is_account_active,
//     getDeviceInfo,
//     authControllers.writeQuery_GET
//   )
//   .post(authControllers.writeQuery_POST);














// // Security Question
// router
//   .route("/2fa/security-question")
//   .get(protect, is_account_active, authControllers.enable_security_question_GET)
//   .post(
//     protect,
//     is_account_active,
//     authControllers.enable_security_question_POST
//   )
//   .put(protect, is_account_active, authControllers.change_security_question_PUT)
//   .delete(
//     protect,
//     is_account_active,
//     authControllers.disable_security_question_DELETE
//   );

// router
//   .route("/2fa/security-question/verify")
//   .get(authControllers.verify_security_question_during_login_GET)
//   .post(authControllers.verify_security_question_during_login_POST);

// //-----------------------------
// // Account recover options
// // Option (1)
// router
//   .route("/account-recovery/backup-codes")
//   .get(protect, is_account_active, authControllers.showBackupCodes_GET)
//   .post(protect, is_account_active, authControllers.generateBackupCodes_POST)
//   .delete(
//     protect,
//     is_account_active,
//     authControllers.disableBackupCodes_DELETE
//   );

// router
//   .route("/account-recovery/backup-codes/confirm")
//   .get(authControllers.confirmBackupCodes_GET)
//   .post(authControllers.confirmBackupCodes_POST);

// router
//   .route("/account-recovery/backup-codes/regenerate")
//   .get(authControllers.regenerateBackupCodes_GET)
//   .post(authControllers.regenerateBackupCodes_POST);

// router
//   .route("/account-recovery/backup-codes/verify")
//   .get(authControllers.verifyBackupCodes_GET)
//   .post(authControllers.verifyBackupCodes_POST);

// // Option (2)
// router
//   .route("/account-recovery/trusted-email")
//   .get(protect, is_account_active, authControllers.generateTrustedEmail_GET)
//   .post(protect, is_account_active, authControllers.generateTrustedEmail_POST)
//   .delete(
//     protect,
//     is_account_active,
//     authControllers.disableTrustedEmail_DELETE
//   );

// router
//   .route("/account-recovery/trusted-email/verify/:token")
//   .get(authControllers.verifyEnableTrustedEmail_GET);

// // During Recovery
// router
//   .route("/account-recovery/trusted-email/send")
//   .get(authControllers.sendEmailToTrustedEmail_during_recovery_GET)
//   .post(authControllers.sendEmailToTrustedEmail_during_recovery_POST);

// router
//   .route("/account-recovery/trusted-email/verify-during-recovery/:token")
//   .get(authControllers.verifyTrustedEmail_during_recovery_GET);

// //=======================================

// // Export my router instance

// module.exports = router;
