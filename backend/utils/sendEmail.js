// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'bokamaravind@gmail.com',
//     pass: 'pshi woaj zlcz obbx' // Use an App Password, not your Gmail password!
//   }
// });

// module.exports = async function sendEmail({ to, subject, text }) {
//   await transporter.sendMail({
//     from: '"NZ Project" <bokamaravind@gmail.com>',
//     to,
//     subject,
//     text
//   });
// };


require('dotenv').config(); // Load environment variables
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Fetched from .env
    pass: process.env.EMAIL_PASS  // Fetched from .env
  }
});

module.exports = async function sendEmail({ to, subject, text }) {
  await transporter.sendMail({
    from: `"NZ Project" <${process.env.EMAIL_USER}>`, // Using the env var here is also good practice
    to,
    subject,
    text
  });
};