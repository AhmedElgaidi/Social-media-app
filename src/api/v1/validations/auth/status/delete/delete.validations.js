const {
  deleteAccount_DELETE_service,
} = require("../../../../services/auth/status/delete/delete.services");

const deleteAccount_DELETE_controller = async (req, res, next) => {
  await deleteAccount_DELETE_service({ req, res, next });
};

module.exports = {
  deleteAccount_DELETE_controller,
};
