const nodemailer = require('nodemailer');
const logger = require('../middleware/logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"CinemaVerse" <${process.env.EMAIL_USER}>`,
      to, subject, html, text,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email failed: ${error.message}`);
    throw error;
  }
};

module.exports = { sendEmail };
