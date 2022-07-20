const bcrypt = require("bcrypt");

const is_phone_code_match = async (givenCode, userCode) => {
  return await bcrypt.compare(givenCode, userCode);
};

module.exports = is_phone_code_match;
