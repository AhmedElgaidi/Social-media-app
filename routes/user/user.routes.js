const express = require("express");

// Import our controllers
const userControllers = require("../../controllers/user/userInfo.controllers");
//======================================

// Let's create our express router instance
const router = express.Router();

//=======================================

// My Routes
router.route("/test").post(userControllers.createUser_POST);

//=======================================

// Export my router instance

module.exports = router;
