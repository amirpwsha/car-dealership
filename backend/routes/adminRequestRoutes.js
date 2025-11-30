const express = require('express');
const router = express.Router();
const db = require('../db');
const { authRequired, adminOnly } = require('../middleware/auth');

// دریافت همه‌ی درخواست‌ها
router.get('/all', authRequired, adminOnly, (req, res) => {
  db.query(
    `
      SELECT pr.id, pr.request_date, pr.status,
             u.username, u.email,
             c.brand, c.model, c.price
      FROM PurchaseRequests pr
      JOIN users u ON pr.user_id = u.id
      JOIN cars c ON pr.car_id = c.id
      ORDER BY pr.id DESC
    `,
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ requests: rows });
    }
  );
});

// تایید درخواست
router.post('/approve', authRequired, adminOnly, (req, res) => {
  const { request_id } = req.body;

  db.query(
    "UPDATE PurchaseRequests SET status='approved' WHERE id=?",
    [request_id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "درخواست با موفقیت تأیید شد" });
    }
  );
});

// رد درخواست
router.post('/reject', authRequired, adminOnly, (req, res) => {
  const { request_id } = req.body;

  db.query(
    "UPDATE PurchaseRequests SET status='rejected' WHERE id=?",
    [request_id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "درخواست رد شد" });
    }
  );
});

module.exports = router;
