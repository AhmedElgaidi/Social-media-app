const verifyOTP_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { otp } = req.body,
    { userId } = req.params;

  // (2) Check for their existence
  // If ID is not found
  if (!userId) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find the user ID.",
    });
  }

  // IF otp is not found
  if (!otp) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find the otp.",
    });
  }

  // If otp length isn't correct, we don't have to check it in our db, right!
  if (otp.toString().length != 6) {
    res.status(422).json({
      name: "Invalid Input",
      description: "This otp length can't be correct!",
    });
  }

  // (3) Pass them to the service function
  return {
    userId,
    otp,
  };
};

const re_generate_send_OTP_POST_validation = ({ req, res, next }) => {
  // (1) Get user ID from request
  const { userId } = req.body;

  // (2) If not found in request
  if (!userId) {
    return res.status(404).json({
      name: "Not Found",
      description: "You have to send your ID.",
    });
  }

  // (3) Pass ID to service function
  return {
    userId,
  };
};

module.exports = {
  verifyOTP_POST_validation,
  re_generate_send_OTP_POST_validation,
};
