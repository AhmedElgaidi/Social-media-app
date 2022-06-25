const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // (1) Create a transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // (2) Define the email options
  const mailOptions = {
    from: "Ahmed Elgaidi",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // (3) Send the email with nodemailer
  await transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    return console.log(`Email sent: ${info.response}`);
  });
};

module.exports = sendEmail;
