const signup_POST_validation = ({ req, res, next }) => {
  // (1) Get user data from request
  const {
    first_name,
    last_name,
    user_name,
    email,
    password,
    confirm_password,
  } = req.body;

  // (2) If they don't exist

  // If first name is not found
  if (!first_name) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find your first name field in the request.",
    });
  }

  // If last name is not found
  if (!last_name) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find your last name field in the request.",
    });
  }

  // If user name is not found
  if (!user_name) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find your user name field in the request.",
    });
  }

  // If email is not found
  if (!email) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find your email field in the request.",
    });
  }

  // If first name is not found
  if (!password) {
    return res.status(404).json({
      name: "Not Found",
      description: "Sorry, we can't find your password field in the request.",
    });
  }

  if (!confirm_password) {
    return res.status(404).json({
      name: "Not Found",
      description:
        "Sorry, we can't find your confirm password field in the request.",
    });
  }

  // (3) password and confirm password fields don't match
  if (password.toString() !== confirm_password.toString()) {
    return res.status(422).json({
      name: "Invalid Input",
      description:
        "The password and the confirm password fields has to match!!!",
    });
  }

  // (4) Pass the user data to the service function
  return {
    first_name,
    last_name,
    user_name,
    email,
    password,
    confirm_password,
  };
};

module.exports = {
  signup_POST_validation,
};
