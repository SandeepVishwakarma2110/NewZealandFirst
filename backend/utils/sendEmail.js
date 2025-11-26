const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bokamaravind@gmail.com',
    pass: 'pshi woaj zlcz obbx' // Use an App Password, not your Gmail password!
  }
});

module.exports = async function sendEmail({ to, subject, text }) {
  await transporter.sendMail({
    from: '"NZ Project" <bokamaravind@gmail.com>',
    to,
    subject,
    text
  });
};