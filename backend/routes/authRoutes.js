// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = 'dev_secret_change_me'; // برای پروژه واقعی .env

// ثبت‌نام
router.post('/signup', (req, res) => {
  const { username, email, password, role } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'فیلدهای لازم را پر کنید' });
  }

  db.query('SELECT id FROM Users WHERE email = ?', [email], async (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (rows.length > 0) return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده' });

    const hash = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'customer';

    db.query(
      'INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hash, userRole],
      (err2) => {
        if (err2) return res.status(500).json({ error: 'DB error' });
        return res.json({ message: 'ثبت‌نام موفق بود' });
      }
    );
  });
});

// ورود
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'ایمیل و رمزعبور لازم است' });

  db.query('SELECT * FROM Users WHERE email = ?', [email], async (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (rows.length === 0) return res.status(401).json({ error: 'کاربر یافت نشد' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'رمزعبور نادرست است' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000
    });

    return res.json({ message: 'ورود موفق', role: user.role });
  });
});

router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'وارد نشده‌اید' });

  try {
    const data = jwt.verify(token, JWT_SECRET);
    return res.json({ user: data });
  } catch {
    return res.status(401).json({ error: 'نشست نامعتبر است' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'خروج انجام شد' });
});

module.exports = router;
