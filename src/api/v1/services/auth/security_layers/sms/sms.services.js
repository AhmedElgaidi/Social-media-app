const User = require("./../../../../models/user/User");

//==================================================================================

// method (3): Text message (send code as sms)
// During setup:
const smsPage_during_setup_GET_service = ({ req, res, next }) => {
  res
    .status(200)
    .send(
      "The page where you enter phone number and start to setup your sms as 2fa method."
    );
};

const generateSendSMS_POST_service = async ({ req, res, next }) => {
  // (1) Get userId and phone number from request
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

  // (3) Get user document
  const user = await User.findById(userId).select({
    "account.two_fa.sms": 1,
    "account.email": 1,
  });

  // (4) Check if this feature is already enabled
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  // If not enabled
  if (is_sms_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description: "This 2fa method (sms) is already enabled in your account.",
    });
  }

  // (5) Check if he/ she already has a code and still valid
  if (
    user.account.two_fa.sms.value &&
    user.account.two_fa.sms.expires_at > Date.now()
  ) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "We already assigned and sent you a code in an SMS (It's still valid there!).",
    });
  }

  // If everything is okay. Then,

  // (6) Generate a random 6 digits code
  const code = Math.floor(100000 + Math.random() * 900000);
  console.log("SMS code:", code);

  // (7) Assign the code and phone number to the user document
  user.account.two_fa.sms.value = code;
  user.account.two_fa.sms.phone.value = phone;

  // 8) Save user document
  await user.save();

  // (9) Setup and send sms with the generated code
  // Setup the client
  const client = new twilio(
    process.env.TWILIO_ACCOUNT_ID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Send the SMS
  // TODO: We'll just see it in the console, to decrease call to twilio API
  // await client.messages.create({
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: "+20" + phone,
  //   body: `Hello, there.\nThis is your "${code}" 2fa (Only valid for 15 min).`,
  // });

  // (10) Redirect him. So he can verify the sent code!
  res.status(301).redirect("/api/v1/auth/2fa/sms/setup/verify");
};

const disableSMS_DELETE_service = async ({ req, res, next }) => {
  // (1) Get userId from request
  const userId = req.userId;

  // (2) Get user document
  const user = await User.findById(userId).select({
    "account.two_fa.sms": 1,
  });

  // (3) Check if this method is already disabled
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  // If it's already disabled
  if (!is_sms_enabled) {
    res.status(422).json({
      name: "Success",
      description: "Your account is already disabled.",
    });
  }

  // (3) Update user document
  user.account.two_fa.sms.is_enabled = false;

  // (4) Save user document
  await user.save();

  // (5) Inform the frontend with the status
  res.status(200).json({
    name: "Success",
    description: "You have disabled this 2fa method (SMS) successfully.",
  });
};

const verifySMS_duringSetup_GET_service = ({ req, res, next }) => {
  res.status(200).json({
    url: req.url,
    message: "Please, send the received code as sms!",
  });
};

const verifySMS_duringSetup_POST_service = async ({ req, res, next }) => {
  // (1) Get userId and code from request
  const { code } = req.body,
    userId = req.userId;

  // If code is not found
  if (!code) {
    return res.status(404).json({
      name: "Not Found",
      description: "We can't find the code in the request.",
    });
  }

  // (2) Get user document from DB
  const user = await User.findById(userId).select({
    "account.two_fa.sms": 1,
  });

  // (3) Check if this feature is already enabled
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  // If it's already enabled
  if (is_sms_enabled) {
    return res.status(422).json({
      name: "Success",
      description: "This 2fa method (SMS) is already enabled in your account.",
    });
  }

  // (4) Get user's saved hashed code
  const hashedCode = user.account.two_fa.sms.value;

  // If hashed code is undefined, it means the user is not assigned any code before!
  if (hashedCode == undefined) {
    res.status(422).json({
      name: "Invalid Input",
      description:
        "Sorry, you need to ask first for code from this endpoint /2fa/sms by sending us your phone number.",
    });
  }

  // (5) Check the code against the saved code in DB
  const is_match = await is_phone_code_match(code, hashedCode);

  // If code is not valid
  if (!is_match) {
    return res.status(422).json({
      name: "Invalid Input",
      description: "Sorry, the given code is not valid",
    });
  }

  // (6) Check if the code is expired or not!!
  if (user.account.two_fa.sms.expires_at < Date.now()) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "Your code is already expired. Please click the resend button to get new code!",
    });
  }

  // If everything is okay. Then,

  // (6) If it's valid, then make phone verified and enable this 2fa feature
  user.account.two_fa.sms.phone.is_verified = true;
  user.account.two_fa.sms.is_enabled = true;

  // (7) Delete the other fields
  user.account.two_fa.sms.created_at = undefined;
  user.account.two_fa.sms.expires_at = undefined;
  user.account.two_fa.sms.value = undefined;

  // (7) Save user document
  await user.save();

  // (8) Inform the frontend with the status
  res.status(200).json({
    name: "Success",
    description:
      "Congrats, you enabled the 3rd 2fa method (code over SMS) successfully.",
  });
};

const resendSMS_during_setup_POST_service = async ({ req, res, next }) => {
  // (1) Get userId from previous middleware
  const userId = req.userId;

  // (2) Get user document from DB
  const user = await User.findById(userId).select({
    "account.two_fa.sms": 1,
  });

  // (3) Check if it's already enabled
  if (user.account.two_fa.sms.is_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description: "You already enabled this feature as 2fa (Code over SMS)!",
    });
  }

  // (4) Check if he has a code and still valid
  if (
    user.account.two_fa.sms.value &&
    user.account.two_fa.sms.expires_at > Date.now()
  ) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "You already have a valid code. So, we can't send you new until it's expired!",
    });
  }

  // If It's really expired. Then,

  // (5) Generate The SMS code
  const code = Math.floor(100000 + Math.random() * 900000);
  console.log("SMS code:", code);

  // (6) Update user document
  user.account.two_fa.sms.value = code;

  // (7) Save user document
  await user.save();

  // (8) Setup and send sms with the generated code
  // Setup the client
  const client = new twilio(
    process.env.TWILIO_ACCOUNT_ID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // (9) Send the SMS
  // TODO: We'll just see it in the console, to decrease call to twilio API
  // await client.messages.create({
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: "+20" + phone,
  //   body: `Hello, there.\nThis is your "${code}" 2fa (Only valid for 15 min).`,
  // });

  // (10) Redirect him. So he can verify the sent code!
  res.status(301).redirect("/api/v1/auth/2fa/sms/setup/verify");
};

// During login process:
const generateSendSMS_duringLogin_GET_service = ({ req, res, next }) => {
  res.status(200).json({
    url: req.url,
    message:
      "Please, click the button to send you the code over an sms message.",
  });
};

const generateSendSMS_duringLogin_POST_service = async ({ req, res, next }) => {
  // generate and save and send the code
  // redirect him
  // (1) Get userId form request
  const { userId } = req.body;

  // If user ID not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "We can't find your id in the request!",
    });
  }

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.two_fa.sms": 1,
  });

  // If user not found
  if (!user) {
    return res.status(404).json({
      name: "User Not Found",
      description: "Sorry, we can't find a user with this ID.",
    });
  }

  // (3) Check if he/ she already has a code and still valid
  if (
    user.account.two_fa.sms.value &&
    user.account.two_fa.sms.expires_at > Date.now()
  ) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "We already assigned and sent you a code in an SMS (It's still valid there!).",
    });
  }

  // If everything is okay. Then,

  // (4) Generate a random 6 digits code
  const code = Math.floor(100000 + Math.random() * 900000);
  console.log("SMS code:", code);

  // (5) Assign the code and phone number to the user document
  user.account.two_fa.sms.value = code;

  // (6)) Save user document
  await user.save();

  // (7) Setup and send sms with the generated code
  // Setup the client
  const client = new twilio(
    process.env.TWILIO_ACCOUNT_ID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // (8) Send the SMS
  // TODO: We'll just see it in the console, to decrease call to twilio API
  // await client.messages.create({
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: "+20" + phone,
  //   body: `Hello, there.\nThis is your "${code}" 2fa (Only valid for 15 min).`,
  // });

  // (9) Redirect him. So he can verify the sent code!
  res.status(301).redirect("/api/v1/auth/2fa/sms/verify");
};

const verifySMS_duringLogin_GET_service = ({ req, res, next }) => {
  res.status(200).json({
    url: req.url,
    message:
      "Please, send us the code sent to you over sms message. So, we can use it to verify your identity.",
  });
};

const verifySMS_duringLogin_POST_service = async ({ req, res, next }) => {
  // (1) Get userId and code from request
  const { userId, code } = req.body;

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

  // (2) Get user from DB
  const user = await User.findById(userId).select({
    "account.two_fa.sms": 1,
  });

  // If user not found
  if (!user) {
    return res.status(404).json({
      name: "User Not Found",
      description: "Sorry, we can't find a user with this ID.",
    });
  }

  // (3) Check if this feature is enabled or not
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  // If not enabled
  if (!is_sms_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description: "Sorry, this feature is not enabled in your account.",
    });
  }

  // (4) Check for code expiration date
  const is_code_expired = user.account.two_fa.sms.expires_at <= Date.now();

  // If it's already expired
  if (is_code_expired) {
    return res.status(422).json({
      name: "Code Expired",
      description:
        "Sorry, the code is already expired. You can ask for a new one by clicking the resend button.",
    });
  }

  // (5) Check for code validity
  const is_code_same = await bcrypt.compare(
    code,
    user.account.two_fa.sms.value
  );

  // If not same
  if (!is_code_same) {
    return res.status(422).json({
      name: "Invalid Code",
      description: "Sorry, the code doesn't match with the sent one.",
    });
  }

  // (6) If there are any other security layers enabled (only remains the security question)
  // Method (4) Security Question
  const is_security_question_enabled = user.account.two_fa.question.is_enabled;

  if (is_security_question_enabled) {
    return res
      .status(301)
      .redirect("/api/v1/auth/2fa/security-question/verify");
  }

  // If everything is okay. Then,

  // (7) Give user access to our private resources
  await giveAccess({ user, req, res });
};

const resendSMS_during_login_POST_service = async ({ req, res, next }) => {
  // (1) Get userId from request
  const { userId } = req.body;

  // If not found
  if (!userId) {
    return res.status(404).json({
      name: "ID Not Found",
      description: "Sorry, we can't find the ID in the request",
    });
  }

  // (2) Get user form DB
  const user = await User.findById(userId).select({
    "account.two_fa.sms": 1,
  });

  // If user not found
  if (!user) {
    return res.status(404).json({
      name: "User Not Found",
      description: "Sorry, we cant' find a user with this ID",
    });
  }

  // (3) Check if he/ she enabled this feature
  const is_sms_enabled = user.account.two_fa.sms.is_enabled;

  // If not enabled
  if (!is_sms_enabled) {
    return res.status(400).json({
      name: "Bad Request",
      description: "This feature is not enabled in your account.",
    });
  }

  // (4) Check if he/ she already has a valid not expired code
  if (
    user.account.two_fa.sms.value &&
    user.account.two_fa.sms.expires_at > Date.now()
  ) {
    return res.status(400).json({
      name: "Bad Request",
      description:
        "We already assigned and sent you a code in an SMS (It's still valid there!).",
    });
  }

  // If everything is okay. Then,

  // (5) Generate The SMS code
  const code = Math.floor(100000 + Math.random() * 900000);
  console.log("SMS code:", code);

  // (6) Update user document
  user.account.two_fa.sms.value = code;

  // (7) Save user document
  await user.save();

  // (8) Setup and send sms with the generated code
  // Setup the client
  const client = new twilio(
    process.env.TWILIO_ACCOUNT_ID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // (9) Send the SMS
  // TODO: We'll just see it in the console, to decrease call to twilio API
  // await client.messages.create({
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: "+20" + phone,
  //   body: `Hello, there.\nThis is your "${code}" 2fa (Only valid for 15 min).`,
  // });

  // (10) Redirect him to the verifying endpoint
  res.status(301).redirect("/api/v1/auth/2fa/sms/verify");
};

module.exports = {
  // During setup
  smsPage_during_setup_GET_service,
  generateSendSMS_POST_service,
  disableSMS_DELETE_service,
  verifySMS_duringSetup_GET_service,
  verifySMS_duringSetup_POST_service,
  resendSMS_during_setup_POST_service,

  // During login
  generateSendSMS_duringLogin_GET_service,
  generateSendSMS_duringLogin_POST_service,
  verifySMS_duringLogin_GET_service,
  verifySMS_duringLogin_POST_service,
  resendSMS_during_login_POST_service,
};
