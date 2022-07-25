const enable_question_POST_validation = ({ req, res, next }) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get the given params from request
  const { question, answer, hint } = req.body;

  // (3) validate
  // If question is not found
  if (!question) {
    return res.status(404).json({
      name: "Invalid Input",
      description: "You need to send the question in order to proceed.",
    });
  }
  // If answer is not found
  if (!answer) {
    return res.status(404).json({
      name: "Invalid Input",
      description: "You need to send the answer in order to proceed.",
    });
  }

  // If hint is not found
  if (!hint) {
    return res.status(404).json({
      name: "Invalid Input",
      description: "You need to send the hint in order to proceed.",
    });
  }

  // (4) Pass data to the service function
  return { userId, question, answer, hint };
};

const change_question_PUT_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const userId = req.userId;
  const { question, answer, hint } = req.body;

  // (2) validate
  // If question is not found
  if (!question) {
    return res.status(404).json({
      name: "Invalid Input",
      description: "You need to send the question in order to proceed.",
    });
  }
  // If answer is not found
  if (!answer) {
    return res.status(404).json({
      name: "Invalid Input",
      description: "You need to send the answer in order to proceed.",
    });
  }

  // If hint is not found
  if (!hint) {
    return res.status(404).json({
      name: "Invalid Input",
      description: "You need to send the hint in order to proceed.",
    });
  }

  // (3) Pass dat to the service function
  return {
    userId,
    question,
    answer,
    hint,
  };
};

const verifySMS_duringLogin_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const { userId, answer } = req.body;

  // (2) Validate
  // If user ID is not found
  if (!userId) {
    return res.status(404).json({
      name: "Id Not Found",
      description: "Sorry, we can't find the ID in the request",
    });
  }

  // If answer is not found
  if (!answer) {
    return res.status(404).json({
      name: "Answer Not Found",
      description:
        "Sorry, we can't find the answer to the security question in the request",
    });
  }

  // (3) Pass data to the service function
  return {
    userId, answer
  }
};

module.exports = {
  enable_question_POST_validation,
  change_question_PUT_validation,
  verifySMS_duringLogin_POST_validation
};
