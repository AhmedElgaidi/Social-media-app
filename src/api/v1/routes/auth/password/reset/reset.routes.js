const express = require("express");

const {
  resetPassword_GET_controller,
  resetPassword_POST_controller,
} = require("./../../../../controllers/auth/password/reset/reset.controllers");

//========================================

const router = express.Router();

router
  .route("/reset-password/:token/:userId")
  .get(resetPassword_GET_controller)
  .post(resetPassword_POST_controller);

module.exports = router;
