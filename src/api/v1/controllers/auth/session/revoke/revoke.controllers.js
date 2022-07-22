const {
  revokeSession_DELETE_service,
} = require("../../../../services/auth/session/revoke/revoke.services");

//====================================================================

const revokeSession_DELETE_controller = async(req, res, next) => {
  await revokeSession_DELETE_service({ req, res, next });
};

module.exports = {
  revokeSession_DELETE_controller,
};
