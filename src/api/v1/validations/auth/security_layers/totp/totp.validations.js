const scanTOTP_qrCode_GET_validation = ({ req, res, next }) => {
  // (1) Get qrcode from request parameters
  const qrcode = req.params.qrcode;

  // (2) If not found
  if (!qrcode) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find the QR code in th request parameters.",
    });
  }

  // (3) Pass qrcode to the service function
  return {
    qrcode,
  };
};

const verifyTOTP_during_setup_POST_validation = ({ req, res, next }) => {
  // (1) Get token from request
  const { token } = req.body;

  // (2) If not found
  if (!token) {
    res.status(404).json({
      name: "Not Found",
      description:
        "Please, send your token generated from your authenticator app!!",
    });
  }

  // (3) Pass token to the service function
  return {
    token,
  };
};

const verifyTOTP_during_login_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { code } = req.body,
    { userId } = req.params;
    
  // (2) Check for their existence
  // If userId is not found
  if (!userId) {
    res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find the ID in the request.",
    });
  }

  // If token is not found
  if (!code) {
    res.status(404).json({
      name: "Not Found",
      description:
        "Please, send your token generated from your authenticator app!!",
    });
  }

  // (3) Pass user data to the service function
  return {
    userId,
    code,
  };
};

module.exports = {
  scanTOTP_qrCode_GET_validation,
  verifyTOTP_during_setup_POST_validation,
  verifyTOTP_during_login_POST_validation,
};
