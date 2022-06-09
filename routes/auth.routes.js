const express = require("express");

// Import our controllers
const authControllers = require("../controllers/auth.controllers");
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
  
//=======================================

// Export my router instance

module.exports = router;
