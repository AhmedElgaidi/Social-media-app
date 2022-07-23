const {
  deactivateAccount_POST_service,
} = require("../../../../services/auth/status/deactivate/deactivate.services");

const deactivateAccount_POST_controller = async (req, res, next) => {
  await deactivateAccount_POST_service({ req, res, next });
};

module.exports = {
  deactivateAccount_POST_controller,
};
