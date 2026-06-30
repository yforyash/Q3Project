const transporter = require('../config/email');
require('dotenv').config();

async function sendEmail(to, subject, text, html = '') {
  try {
    console.log(`[SMTP] Sending email to ${to}...`);
    
    // Fallback to generate a beautiful styled HTML template if no HTML layout is provided
    const emailHtml = html || `
      <p>Hello,</p>
      <p>Your Q3 Portal verification code is: <strong>${text.split(': ').pop()}</strong></p>
      <p>This code will expire in 15 minutes.</p>
      <p>Thank you,</p>
      <p>Q3 Support Team</p>
    `;

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"Q3 Support" <support@q3project.com>',
      to,
      subject,
      text,
      html: emailHtml,
    });
    
    console.log(`[SMTP] Success: Email sent to ${to} (MessageID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error('[SMTP] Error: Email delivery failed:', err);
    return false;
  }
}

module.exports = { sendEmail };
