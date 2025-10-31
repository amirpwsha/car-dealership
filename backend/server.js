// server.js
const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Hello World / تست اجرا
app.get('/', (req, res) => {
  res.send('✅ سرور Node.js اجرا شد و به MySQL (XAMPP) وصله');
});

// تست اتصال دیتابیس
app.get('/api/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.send('✅ اتصال موفق! نتیجه: ' + rows[0].result);
  });
});

// API لیست خودروها از دیتابیس
app.get('/api/cars', (req, res) => {
  db.query('SELECT * FROM Cars', (err, rows) => {
    if (err) {
      console.error('❌ خطا در واکشی خودروها:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
