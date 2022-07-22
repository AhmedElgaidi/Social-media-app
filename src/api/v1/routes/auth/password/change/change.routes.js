const express = require("express");

const protect = require('./../../../../middlewares/protect')

const is_account_active = require('./../../../../middlewares/isAccountActive');

const {
    changePassword_POST_controller,
} = require("./../../../../controllers/auth/password/change/change.controllers");

//========================================

const router = express.Router();

router
  .route("/change-password")
  .post(protect, is_account_active, changePassword_POST_controller);

module.exports = router;
