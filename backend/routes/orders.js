const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/orders - Fetch all orders (supports search filter)
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    let queryText = 'SELECT * FROM orders';
    const queryParams = [];

    if (search) {
      queryText += ' WHERE order_id ILIKE $1 OR customer ILIKE $1';
      queryParams.push(`%${search}%`);
    }

    queryText += ' ORDER BY date DESC, id DESC';
    const result = await db.query(queryText, queryParams);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  const { customer, total, items, status } = req.body;
  if (!customer) {
    return res.status(400).json({ error: 'Customer name is required' });
  }
  try {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderTotal = total ? parseFloat(total) : 0.00;
    const orderItems = items ? parseInt(items) : 1;
    const orderStatus = status || 'Pending';

    const result = await db.query(
      'INSERT INTO orders (order_id, customer, total, items, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [orderId, customer, orderTotal, orderItems, orderStatus]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Server error creating order' });
  }
});

module.exports = router;
