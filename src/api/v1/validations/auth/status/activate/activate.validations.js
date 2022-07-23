const {activateAccount_POST_service} = require("../../../../services/auth/status/activate/activate.services");

//=======================================================================

const activateAccount_POST_controller = async (req, res, next) => {
  await activateAccount_POST_service({ req, res, next });
};

module.exports = {
  activateAccount_POST_controller,
};
