const bcrypt = require("bcrypt");

const correct_password = async (givenPassword, userPassword) => {
  return await bcrypt.compare(givenPassword, userPassword);
};

module.exports = correct_password;
