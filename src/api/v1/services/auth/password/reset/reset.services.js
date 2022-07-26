const User = require("./../../../../models/user/User");

const { verify_token } = require("./../../../../helpers/token");

const {
  resetPassword_POST_validation,
} = require("./../../../../validations/auth/password/reset/reset.validations");

//========================================================================

const resetPassword_GET_service = ({ req, res, next }) => {
  res.status(200).json({
    name: "Success",
    description: "This is where you enter your new password",
  });
};

const resetPassword_POST_service = async ({ req, res, next }) => {
  // (1) Get new passwords and password reset token from request
  const {
    token,
    password,
    confirm_password,
  } = resetPassword_POST_validation({ req, res, next });

  // (2) Verify password reset token
  await verify_token({
    token,
    secret: process.env.PASSWORD_RESET_TOKEN_SECRET,
  }).catch((error) => {
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
    "account.reset.password_reset_token": token,
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
