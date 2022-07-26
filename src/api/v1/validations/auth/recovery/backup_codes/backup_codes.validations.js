const confirmBackupCodes_GET_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { userId } = req.params;

  // (2) If userId not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "Sorry, we can't find the ID in the request parameters.",
    });
  }

  // (3) Pass data to the service function
  return {
    userId,
  };
};

const confirmBackupCodes_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { userId } = req.params;

  // (2) If userId not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "Sorry, we can't find the ID in the request parameters.",
    });
  }

  // (3) Pass data to the service function
  return { userId };
};

const regenerateBackupCodes_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { userId } = req.body || req.query;

  // (2) If userId not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "Sorry, we can't find the ID in the request.ds",
    });
  }

  // (3) Pass data to the service function
  return {
    userId,
  };
};

const verifyBackupCodes_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { userId, code } = req.body;

  // (2) Validate
  // If userId not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "Sorry, we can't find the ID in the request.",
    });
  }

  // If code not found
  if (!code) {
    return res.status(404).json({
      name: "Code Not Found",
      description: "Sorry, we can't find the backup code in the request.",
    });
  }

  // IF code length isn't correct
  if (code.length != 12) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Sorry, the code length can't be true!",
    });
  }

  // (3) Pass data to the service function
  return {
    userId,
    code,
  };
};

module.exports = {
  confirmBackupCodes_GET_validation,
  confirmBackupCodes_POST_validation,
  regenerateBackupCodes_POST_validation,
  verifyBackupCodes_POST_validation,
};
