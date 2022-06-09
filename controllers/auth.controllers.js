// Our imports
const User = require("../models/User");
const createAccessToken = require("../helpers/generateAccessToken");
//======================================================================

const signUp_GET = (req, res, next) => {
  res.json({
    message: "Welcome to the sign up page....",
  });
};

const signUp_POST = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.create({
    email_list: {
      email,
    },
    account: {
      password,
    },
  });
  res.json({
    message: "User created successfully",
    user,
  });
};

const login_GET = (req, res, next) => {
  res.json({
    message: "Welcome to the log in page....",
  });
};

const login_POST = async (req, res, next) => {
  const { email, password } = req.body;

  // (1) Check if the email and password exist
  if (!email || !password) {
    return res.send({
      message: "Please, provide your email and passwords!",
    });
  }

  // (2) Check if the user exists in DB
  const user = await User.findOne({
    email_list: {
      email,// put here some operators
    },
  });

  console.log({user});
  // if (!user) {
  //   return res.send({
  //     message: "Please, Provide us with your valid credentials!---------can't find user in DB",
  //   });
  // }

  // (3) Check if password is correct
  // if(user.account.password !== password) {
  //   return res.send({
  //     "message": "Please, provide us with your valid credentials"
  //   });
  // }
  const access_token = createAccessToken(user.id);

  // (4) Save access token in DB
  user.account.tokens_list.push(access_token);
  await user.save();

  return res.send({
    message: "You logged in successfully!",
    user,
  });
};

//======================================================================
// Export our controllers
module.exports = {
  signUp_GET,
  signUp_POST,
  login_GET,
  login_POST,
};
