// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authRequired, adminOnly } = require('../middleware/auth');

// 🔹 داشبورد ادمین:
// لیست کل ماشین‌ها + لیست کل درخواست‌های خرید
// مسیر نهایی:  GET  /api/dashboard/admin
router.get('/admin', authRequired, adminOnly, async (req, res) => {
  try {
    // همه‌ی ماشین‌ها
    const [cars] = await db.promise().query(
      'SELECT * FROM cars ORDER BY id DESC'
    );

    // همه‌ی درخواست‌ها به همراه نام یوزر و اطلاعات ماشین
    const [requests] = await db.promise().query(`
      SELECT 
        pr.id,
        pr.request_date,
        pr.status,
        pr.car_id,
        pr.user_id,
        u.username,
        u.email,
        c.brand,
        c.model,
        c.price
      FROM PurchaseRequests pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN cars c ON pr.car_id = c.id
      ORDER BY pr.request_date DESC
    `);

    return res.json({ cars, requests });
  } catch (err) {
    console.error('Dashboard admin error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// 🔹 داشبورد کاربر:
// فقط درخواست‌های خود کاربر لاگین‌شده
// مسیر نهایی:  GET  /api/dashboard/user
router.get('/user', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const [requests] = await db.promise().query(
      `
      SELECT 
        pr.id,
        pr.request_date,
        pr.status,
        pr.car_id,
        c.brand,
        c.model,
        c.price
      FROM PurchaseRequests pr
      LEFT JOIN cars c ON pr.car_id = c.id
      WHERE pr.user_id = ?
      ORDER BY pr.request_date DESC
      `,
      [userId]
    );

    return res.json({ requests });
  } catch (err) {
    console.error('Dashboard user error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
