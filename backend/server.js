// server.js
const express = require('express');
const path = require('path');
const db = require('./db');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

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
  res.send('✅ سرور Node.js اجرا شد و به MySQL (XAMPP) وصله');
});

// ✅ فقط یک API برای خودروها (با JOIN تصاویر)
app.get('/api/cars', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT cars.id, cars.brand, cars.model, cars.year, cars.price, cars.status, carimages.image_url
      FROM cars
      LEFT JOIN carimages ON cars.id = carimages.car_id
    `);

    // گروه‌بندی عکس‌ها برای هر خودرو
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
    console.error('❌ خطا در واکشی خودروها:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ در آخر، بعد از همه‌ی روت‌ها:
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
