const express = require("express");

const protect = require("./../../../../middlewares/protect");

const is_account_active = require("./../../../../middlewares/isAccountActive");

const {
  deactivateAccount_POST_controller,
} = require("./../../../../controllers/auth/status/deactivate/deactivate.controllers");

//========================================

const router = express.Router();

router
  .route("/deactivate-account")
  .post(protect, is_account_active, deactivateAccount_POST_controller);

module.exports = router;
