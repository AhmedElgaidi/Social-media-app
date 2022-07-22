const express = require("express");

const protect = require("./../../../../middlewares/protect");

const is_account_active = require("./../../../../middlewares/isAccountActive");

const {
  logout_DELETE_controller,
} = require("./../../../../controllers/auth/access/logout/logout.controllers");

//========================================

const router = express.Router();

router
  .route("/logout")
  .delete(protect, is_account_active, logout_DELETE_controller);

module.exports = router;
