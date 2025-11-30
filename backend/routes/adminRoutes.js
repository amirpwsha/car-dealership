const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { authRequired, adminOnly } = require('../middleware/auth');

// ادمین جدید بساز
router.post('/create-admin', authRequired, adminOnly, async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "فیلدها کامل نیست" });

  const hash = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, "admin")',
    [username, email, hash],
    err => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "ادمین جدید ایجاد شد" });
    }
  );
});

// حذف مدیر
router.post('/delete-admin', authRequired, adminOnly, (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "ایمیل لازم است" });

  db.query(
    'DELETE FROM users WHERE email = ? AND role = "admin"',
    [email],
    err => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "ادمین حذف شد" });
    }
  );
});

module.exports = router;
