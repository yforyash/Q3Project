const db = require('../config/db');

async function generateOTP(email, purpose, metadata = null) {
  // Clean up any existing OTPs for this email and purpose first
  await db.query('DELETE FROM otps WHERE email = $1 AND purpose = $2', [email, purpose]);

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await db.query(
    'INSERT INTO otps (email, code, purpose, expires_at, metadata) VALUES ($1, $2, $3, $4, $5)',
    [email, code, purpose, expiresAt, metadata ? JSON.stringify(metadata) : null]
  );
  return code;
}

async function verifyOTP(email, code, purpose) {
  const res = await db.query(
    'SELECT * FROM otps WHERE email = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1',
    [email, purpose]
  );
  if (res.rows.length === 0) return { valid: false, message: 'OTP not found' };
  const otp = res.rows[0];
  if (new Date() > new Date(otp.expires_at)) return { valid: false, message: 'OTP expired' };
  if (otp.attempts >= 5) return { valid: false, message: 'Max attempts exceeded' };
  if (otp.code !== code) {
    await db.query('UPDATE otps SET attempts = attempts + 1 WHERE id = $1', [otp.id]);
    return { valid: false, message: 'Invalid OTP code' };
  }
  await db.query('DELETE FROM otps WHERE email = $1 AND purpose = $2', [email, purpose]);
  return { valid: true, metadata: otp.metadata };
}

module.exports = { generateOTP, verifyOTP };
