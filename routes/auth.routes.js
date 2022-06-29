const express = require("express");

// Import our controllers
const authControllers = require("../controllers/auth.controllers");
const protect = require("../middlewares/protect");
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
  .post(authControllers.login_POST);

router.route("/verify-email/:token").post(authControllers.verifyAccount_POST);

router
  .route("/write-query")
  .get(protect, authControllers.writeQuery_GET)
  .post(protect, authControllers.writeQuery_POST);

router.route("/refresh").post(authControllers.refreshToken_POST);
//=======================================

// Export my router instance

module.exports = router;
