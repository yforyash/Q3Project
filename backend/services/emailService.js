const transporter = require('../config/email');
require('dotenv').config();

async function sendEmail(to, subject, text, html = '') {
  try {
    console.log(`[SMTP] Sending email to ${to}...`);
    
    // Fallback to generate a beautiful styled HTML template if no HTML layout is provided
    const emailHtml = html || `
      <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; max-width: 550px; margin: auto; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
        <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 20px;">Q3 Enterprise Secure Portal 🛡️</h2>
        <p style="font-size: 14px; line-height: 1.5;">Hello,</p>
        <p style="font-size: 14px; line-height: 1.5;">To verify your email address and activate your Q3 account, please enter the following 6-digit verification code on the verification screen:</p>
        <div style="font-size: 26px; font-weight: bold; text-align: center; color: #ffffff; background-color: #2563eb; padding: 15px; border-radius: 6px; letter-spacing: 6px; margin: 25px 0; font-family: monospace;">
          ${text.replace(/[^0-9]/g, '') || text}
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This OTP code is valid for 15 minutes. If you did not initiate this request, please change your credentials immediately or contact system administration.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">This is an automated system notification. Please do not reply directly to this message.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"Q3 Support" <yashagarwal1755@gmail.com>',
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
