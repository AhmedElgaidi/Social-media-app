const express = require("express");

const protect = require("./../../../../middlewares/protect");

const is_account_active = require("./../../../../middlewares/isAccountActive");

const {
  showBackupCodes_GET_controller,
  generateBackupCodes_POST_controller,
  disableBackupCodes_DELETE_controller,
  confirmBackupCodes_GET_controller,
  confirmBackupCodes_POST_controller,
  regenerateBackupCodes_GET_controller,
  regenerateBackupCodes_POST_controller,
  verifyBackupCodes_GET_controller,
  verifyBackupCodes_POST_controller,
} = require("./../../../../controllers/auth/recovery/backup_codes/backup_codes.controllers");

//========================================

const router = express.Router();

// Account recover options
// Option (1)
router
  .route("/backup-codes")
  .get(protect, is_account_active, showBackupCodes_GET_controller)
  .post(protect, is_account_active, generateBackupCodes_POST_controller)
  .delete(protect, is_account_active, disableBackupCodes_DELETE_controller);

router
  .route("/backup-codes/confirm/:userId")
  .get(confirmBackupCodes_GET_controller)
  .post(confirmBackupCodes_POST_controller);

router
  .route("/backup-codes/regenerate")
  .get(regenerateBackupCodes_GET_controller)
  .post(regenerateBackupCodes_POST_controller);

router
  .route("/backup-codes/verify")
  .get(verifyBackupCodes_GET_controller)
  .post(verifyBackupCodes_POST_controller);

module.exports = router;
