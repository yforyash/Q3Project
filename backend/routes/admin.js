const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/users', requireAuth, requireAdmin, adminController.getUsers);
router.post('/users/:id/disable', requireAuth, requireAdmin, adminController.disableUser);
router.post('/users/:id/enable', requireAuth, requireAdmin, adminController.enableUser);

module.exports = router;
