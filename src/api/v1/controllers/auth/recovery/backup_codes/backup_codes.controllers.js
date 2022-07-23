const {
  showBackupCodes_GET_service,
  generateBackupCodes_POST_service,
  disableBackupCodes_DELETE_service,
  confirmBackupCodes_GET_service,
  confirmBackupCodes_POST_service,
  regenerateBackupCodes_GET_service,
  regenerateBackupCodes_POST_service,
  verifyBackupCodes_GET_service,
  verifyBackupCodes_POST_service,
} = require("./../../../../services/auth/recovery/backup_codes/backup_codes.services");

//=======================================================================

const showBackupCodes_GET_controller = async (req, res, next) => {
  await showBackupCodes_GET_service({ req, res, next });
};

const generateBackupCodes_POST_controller = async (req, res, next) => {
  await generateBackupCodes_POST_service({ req, res, next });
};

const disableBackupCodes_DELETE_controller = async (req, res, next) => {
  await disableBackupCodes_DELETE_service({ req, res, next });
};

const confirmBackupCodes_GET_controller = async (req, res, next) => {
  await confirmBackupCodes_GET_service({ req, res, next });
};

const confirmBackupCodes_POST_controller = async (req, res, next) => {
  await confirmBackupCodes_POST_service({ req, res, next });
};

const regenerateBackupCodes_GET_controller = (req, res, next) => {
  regenerateBackupCodes_GET_service({ req, res, next });
};

const regenerateBackupCodes_POST_controller = async (req, res, next) => {
  await regenerateBackupCodes_POST_service({ req, res, next });
};

const verifyBackupCodes_GET_controller = (req, res, next) => {
  verifyBackupCodes_GET_service({ req, res, next });
};

const verifyBackupCodes_POST_controller = async (req, res, next) => {
  await verifyBackupCodes_POST_service({ req, res, next });
};

module.exports = {
  showBackupCodes_GET_controller,
  generateBackupCodes_POST_controller,
  disableBackupCodes_DELETE_controller,
  confirmBackupCodes_GET_controller,
  confirmBackupCodes_POST_controller,
  regenerateBackupCodes_GET_controller,
  regenerateBackupCodes_POST_controller,
  verifyBackupCodes_GET_controller,
  verifyBackupCodes_POST_controller,
};
