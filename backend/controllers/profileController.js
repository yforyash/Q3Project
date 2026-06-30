const db = require('../config/db');
const { logAudit } = require('../services/auditService');

async function getProfile(req, res) {
  try {
    const profile = await db.query('SELECT id, first_name, last_name, email, phone, bio, profile_picture FROM users WHERE id = $1', [req.user.id]);
    res.status(200).json(profile.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateProfile(req, res) {
  const { first_name, last_name, phone, bio, profile_picture } = req.body;
  try {
    await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone = $3, bio = $4, profile_picture = $5, updated_at = NOW() WHERE id = $6',
      [first_name, last_name, phone, bio, profile_picture, req.user.id]
    );
    await logAudit(req.user.id, 'profile_update', req);
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function deactivateAccount(req, res) {
  try {
    await db.query("UPDATE users SET status = 'deleted' WHERE id = $1", [req.user.id]);
    await logAudit(req.user.id, 'account_deletion', req);
    res.status(200).json({ message: 'Account deactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getProfile, updateProfile, deactivateAccount };
