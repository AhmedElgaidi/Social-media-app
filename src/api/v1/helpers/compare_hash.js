const bcrypt = require("bcrypt");

module.exports = async (givenData, userData) => {
  return await bcrypt.compare(givenData, userData);
};
