const express = require("express");

const protect = require("./../../../../middlewares/protect");

const is_account_active = require("./../../../../middlewares/isAccountActive");

const {
  deleteAccount_DELETE_controller,
} = require("./../../../../controllers/auth/status/delete/delete.controllers");

//========================================

const router = express.Router();


router
  .route("/delete-account")
  .delete(protect, is_account_active, deleteAccount_DELETE_controller);

module.exports = router;
