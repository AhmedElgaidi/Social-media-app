const User = require("./../../../../models/user/User");

const {
  verify_password_reset_token_token,
} = require("./../../../../helpers/tokens/resetToken");

//========================================================================

const resetPassword_GET_service = ({ req, res, next }) => {
  // /reset-password/token/userId
  res.send(
    "This is where you enter your new password (last step in the process)"
  );
};

const resetPassword_POST_service = async ({ req, res, next }) => {
  // (1) Get new passwords and password reset token from request
  const { token: passwordResetToken, userId } = req.params,
    { password, confirm_password } = req.body;

  // (2) Check for their existence in the request

  // If token is not found
  if (!passwordResetToken) {
    return res.status(404).json({
      status: "Not Found",
      description: "Please, send your token!!",
    });
  }

  // If user id is not found
  if (!userId) {
    return res.status(404).json({
      status: "Not Found",
      description: "Please, send your ID!!!",
    });
  }

  // If password and confirm_password are not found
  if (!(password && confirm_password)) {
    return res.status(404).json({
      status: "Not Found",
      description: "Please, send your new password!!",
    });
  }

  // (2) Verify password reset token
  await verify_password_reset_token_token(passwordResetToken).catch((error) => {
    // (1) If user manipulated the token
    if (error.toString().includes("invalid signature")) {
      return res.status(422).json({
        name: "Invalid Token",
        description: "Sorry, your password reset token is manipulated!!",
      });
    }

    // (2) if password reset token is expired
    res.status(401).json({
      name: "Invalid Token",
      description: "Sorry, your password reset token is expired.",
    });
  });

  // (3) Check token and ID in DB
  const user = await User.findOne({
    "account.reset.password_reset_token": passwordResetToken,
  }).select({
    "account.reset": 1,
    "account.password": 1,
  });

  // If user not found
  if (!user) {
    return res.status(422).json({
      status: "Invalid Input",
      description: "We could't find this token associated to any account!!!",
    });
  }

  // IF user is found and really has this token, but his id doesn't match
  if (user && user.id !== userId) {
    return res.status(422).json({
      status: "Invalid Input",
      description: "The given token and ID don't match!!!!",
    });
  }

  // Now, everything is okay. So, we can establish the new password

  // (4) Assign the new password
  user.account.password.value = password;
  user.account.password.confirm_password = confirm_password;

  // (5) Remove reset token from DB
  user.account.reset.password_reset_token = undefined;

  // (6) Save updated user
  await user.save();

  // (7) Inform the frontend with the status
  res.status(200).json({
    Status: "Success",
    description: "Congrats, your new password is saved successfully.",
  });
};

module.exports = {
  resetPassword_GET_service,
  resetPassword_POST_service,
};
