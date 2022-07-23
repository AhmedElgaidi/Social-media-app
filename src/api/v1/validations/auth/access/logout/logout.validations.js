const logout_DELETE_service = require("../../../../services/auth/access/logout/logout.services");

const logout_DELETE_controller = async (req, res, next) => {
  await logout_DELETE_service({ req, res, next });
};

module.exports = {
  logout_DELETE_controller,
};
