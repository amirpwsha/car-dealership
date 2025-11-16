// server.js
const express = require('express');
const path = require('path');
const db = require('./db');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const { authRequired, adminOnly, customerOnly } = require('./middleware/auth');

const app = express();
const port = 3000;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// مسیر احراز هویت
app.use('/api/auth', authRoutes);

// تست اتصال دیتابیس
app.get('/api/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.send('✅ اتصال موفق! نتیجه: ' + rows[0].result);
  });
});

// صفحه‌ی اصلی
app.get('/', (req, res) => {
  res.send('✅ سرور Node.js اجرا شد و به MySQL وصله');
});

// لیست خودروها
app.get('/api/cars', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT cars.id, cars.brand, cars.model, cars.year, cars.price, cars.status, carimages.image_url
      FROM cars
      LEFT JOIN carimages ON cars.id = carimages.car_id
    `);

    const cars = {};
    rows.forEach(r => {
      if (!cars[r.id]) {
        cars[r.id] = {
          id: r.id,
          brand: r.brand,
          model: r.model,
          year: r.year,
          price: r.price,
          status: r.status,
          images: []
        };
      }
      if (r.image_url) cars[r.id].images.push(r.image_url);
    });

    res.json(Object.values(cars));
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ---------------------
// 🔥 داشبورد مدیر
// ---------------------
app.get('/api/admin/dashboard', authRequired, adminOnly, async (req, res) => {
  try {
    const [cars] = await db.promise().query('SELECT * FROM cars');
    res.json({ message: 'پنل مدیر', cars });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

// ---------------------
// 🔥 داشبورد مشتری
// ---------------------
app.get('/api/customer/dashboard', authRequired, customerOnly, async (req, res) => {
  res.json({ message: 'پنل مشتری', user: req.user });
});

// ---------------------
// ❗️ در آخر فقط این
// ---------------------
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
