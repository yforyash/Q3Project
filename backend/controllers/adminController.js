const db = require('../config/db');
const { logAudit } = require('../services/auditService');

async function getUsers(req, res) {
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');
  const offset = (page - 1) * limit;
  try {
    const users = await db.query(
      'SELECT id, first_name, last_name, email, phone, status, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    const countRes = await db.query('SELECT COUNT(*) FROM users');
    res.status(200).json({ users: users.rows, total: parseInt(countRes.rows[0].count), page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function disableUser(req, res) {
  const { id } = req.params;
  try {
    await db.query("UPDATE users SET status = 'disabled' WHERE id = $1", [id]);
    await db.query('UPDATE sessions SET is_active = FALSE WHERE user_id = $1', [id]);
    await db.query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1', [id]);
    await logAudit(req.user.id, 'admin_disable_user', req, { targetUserId: id });
    res.status(200).json({ message: 'User suspended' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function enableUser(req, res) {
  const { id } = req.params;
  try {
    await db.query("UPDATE users SET status = 'active' WHERE id = $1", [id]);
    await logAudit(req.user.id, 'admin_enable_user', req, { targetUserId: id });
    res.status(200).json({ message: 'User re-activated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getUsers, disableUser, enableUser };
