const User = require("./../../../../models/user/User");
const correct_password = require("./../../../../helpers/password");

//===================================================================

const changePassword_POST_service = async ({ req, res, next }) => {
  // (1) Get userId and user data from request
  const { old_password, password, confirm_password } = req.body;
  const userId = req.userId;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.password": 1,
  });

  // (3) check if his old password is correct
  const isCorrectPassword = await correct_password(
    old_password,
    user.account.password.value
  );

  // If password is not correct
  if (!isCorrectPassword) {
    res.status(401).json({
      name: "Invalid credentials",
      description: "Your old password is not correct!!",
    });
  }

  // (4) Assign the new password to user object
  user.account.password.value = password;
  user.account.password.confirm_password = confirm_password;

  // (5) Save user document
  await user.save();

  // (6) Inform front-end about the status
  res.status(200).json({
    status: "Success",
    description: "Congrats, your password changed successfully!!",
  });
};

module.exports = {
  changePassword_POST_service,
};
