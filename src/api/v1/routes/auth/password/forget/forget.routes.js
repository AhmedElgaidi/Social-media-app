const express = require("express");

const {
  forgetPassword_GET_controller,
  forgetPassword_POST_controller,
} = require("./../../../../controllers/auth/password/forget/forget.controllers");

//========================================

const router = express.Router();

router
  .route("/forget-password")
  .get(forgetPassword_GET_controller)
  .post(forgetPassword_POST_controller);

module.exports = router;
