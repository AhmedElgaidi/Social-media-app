const {
  changePassword_POST_service,
} = require("../../../../services/auth/password/change/change.services");

const changePassword_POST_controller = async (req, res, next) => {
  await changePassword_POST_service({ req, res, next });
};

module.exports = {
  changePassword_POST_controller,
};
