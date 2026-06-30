const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'yashagarwal1705@gmail.com',
    pass: process.env.SMTP_PASS || 'nkxa oqta zade fcls',
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
