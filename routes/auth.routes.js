const express = require("express");

// Import our controllers
const authControllers = require("../controllers/auth.controllers");
const protect = require("../middlewares/protect");
const getDeviceInfo = require("../middlewares/getDeviceInfo");
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
  .get(protect, getDeviceInfo, authControllers.writeQuery_GET)
  .post(protect, authControllers.writeQuery_POST);

router.route("/refresh").post(getDeviceInfo, authControllers.refreshToken_POST);

router.route("/sessions").get(protect, authControllers.sessions_GET);
router.route('/revoke-session').get(protect, authControllers.revokeSession_POST);
//=======================================

// Export my router instance

module.exports = router;
