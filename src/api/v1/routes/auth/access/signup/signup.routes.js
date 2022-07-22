const express = require("express");

const {
  signUp_GET_controller,
  signUp_POST_controller,
} = require("./../../../../controllers/auth/access/signup/signup.controllers");

//========================================

const router = express.Router();

router.route("/signup").get(signUp_GET_controller).post(signUp_POST_controller);

module.exports = router;
