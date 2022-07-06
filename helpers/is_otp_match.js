const bcrypt = require("bcrypt");

const is_otp_match = async (givenOTP, userOTP) => {
  return await bcrypt.compare(givenOTP, userOTP);
};

module.exports = is_otp_match;
