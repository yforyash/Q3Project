const db = require('../config/db');

async function getLoginHistory(req, res) {
  try {
    const history = await db.query(
      'SELECT id, ip_address, user_agent, status, failure_reason, created_at FROM login_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.status(200).json(history.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getAuditLogs(req, res) {
  try {
    let logs;
    if (req.user.role === 'admin') {
      logs = await db.query(
        'SELECT a.*, u.email FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 100'
      );
    } else {
      logs = await db.query(
        'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
        [req.user.id]
      );
    }
    res.status(200).json(logs.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getLoginHistory, getAuditLogs };
