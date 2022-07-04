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

router
  .route("/write-query")
  .get(
    protect,
    is_account_active,
    getDeviceInfo,
    authControllers.writeQuery_GET
  )
  .post(protect, is_account_active, authControllers.writeQuery_POST);

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
//=======================================

// Export my router instance

module.exports = router;
