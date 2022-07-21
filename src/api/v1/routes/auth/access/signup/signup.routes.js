const express = require("express");
const path = require("path");
// const {
//   signUp_GET,
//   signUp_POST,
//   test,
// } = require("/controllers/auth/access/signup/signup.controllers");

const { signup_controllers } = require("../../../../controllers");

const result = require(require.main.require("/src/api/v1/controllers/index"))
console.log("------------------------------");
console.log(result);
// console.log("hi", test());
//========================================
// console.log(test());
const router = express.Router();

// router.route("/signup").get(signUp_GET).post(signUp_POST);

module.exports = router;
