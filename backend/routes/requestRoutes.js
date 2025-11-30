const express = require('express');
const router = express.Router();
const db = require('../db');
const { authRequired, customerOnly } = require('../middleware/auth');

// ارسال درخواست خرید
router.post("/send", authRequired, customerOnly, (req, res) => {
  const { car_id } = req.body;
  const user_id = req.user.id;

  if (!car_id) {
    return res.status(400).json({ error: "car_id لازم است" });
  }

  db.query(
    "INSERT INTO PurchaseRequests (user_id, car_id, request_date, status) VALUES (?, ?, NOW(), 'pending')",
    [user_id, car_id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB Error" });
      return res.json({ message: "درخواست خرید با موفقیت ثبت شد!" });
    }
  );
});

// دریافت درخواست‌های مشتری
router.get('/my', authRequired, customerOnly, (req, res) => {
  const user_id = req.user.id;

  db.query(
    `
      SELECT pr.id, pr.request_date, pr.status,
             cars.brand, cars.model, cars.price
      FROM PurchaseRequests pr
      JOIN cars ON pr.car_id = cars.id
      WHERE pr.user_id = ?
    `,
    [user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      return res.json({ requests: rows });
    }
  );
});

module.exports = router;
