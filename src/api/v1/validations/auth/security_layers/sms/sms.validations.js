const generateSendSMS_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { phone } = req.body,
    userId = req.userId;

  // If userId is not found
  if (!userId) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find your ID in the request.",
    });
  }

  // If phone number is not found
  if (!phone) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find your phone number in the request.",
    });
  }

  // (2) Check if the given phone number is not valid
  if (phone.toString().length != 11) {
    return res.status(422).json({
      name: "Invalid Input",
      description:
        "Please, provide use with your correct phone number in this format (eg. 01299929977)'\nWe only accept numbers from Egypt for now.",
    });
  }

  // (3) Pass data to the service function
  return {
    phone,
    userId,
  };
};

const verifySMS_duringSetup_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { code } = req.body,
    userId = req.userId;

  // (2) If code is not found
  if (!code) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find the code in the request.",
    });
  }

  // (3) Pass the data to the service function
  return {
    code,
    userId,
  };
};

const generateSendSMS_duringLogin_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { userId } = req.body;

  // (2) If user ID not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "We can't find your id in the request!",
    });
  }

  // (3) Pass data to the service function
  return {
    userId,
  };
};

const verifySMS_duringLogin_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { userId, code } = req.body;

  // (2) Validate the inputs
  // If UserId not found
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
      description: "Sorry, we can't find the code in the request",
    });
  }

  // If code length is not true
  if (code.toString().length != 6) {
    return res.status(422).json({
      name: "Invalid Code Length",
      description: "The code length can't be true!",
    });
  }

  // (3) Pass the input to the service function
  return {
    userId,
    code,
  };
};

const resendSMS_during_login_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { userId } = req.body;

  // (2) If not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "Sorry, we can't find the ID in the request",
    });
  }

  // (3) Pass the data to the service function
  return {
    userId,
  };
};

module.exports = {
  generateSendSMS_POST_validation,
  verifySMS_duringSetup_POST_validation,
  generateSendSMS_duringLogin_POST_validation,
  verifySMS_duringLogin_POST_validation,
  resendSMS_during_login_POST_validation,
};
