const express = require("express");
const {
  verify_POST_controller,
} = require("./../../../../controllers/auth/access/verify/verify.controllers");

//========================================

const router = express.Router();

router.route("/verify-email/:token").post(verify_POST_controller);

module.exports = router;
