// backend/server.js
const express = require('express');
const path = require('path');
const db = require('./db');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRequestRoutes = require('./routes/adminRequestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminCarRoutes = require('./routes/adminCarRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const { authRequired, adminOnly, customerOnly } = require('./middleware/auth');

const app = express();
const port = 3000;

// ---------------------------
// Middleware
// ---------------------------
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// سرو استاتیک فرانت‌اند
app.use(express.static(path.join(__dirname, '../frontend')));

// ---------------------------
// Routes
// ---------------------------
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin/requests', adminRequestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminCarRoutes);
app.use('/api/dashboard', dashboardRoutes); // داشبورد ادمین/یوزر
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));

// تست اتصال دیتابیس
app.get('/api/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.send('✅ اتصال موفق! نتیجه: ' + rows[0].result);
  });
});

// صفحه اصلی
app.get('/', (req, res) => {
  res.send('✅ سرور Node.js اجرا شد و به MySQL وصله');
});


// ----------------------------------------------------------------
//   لیست خودروها (خروجی برای cars.html) + عکس‌ها با id + url
// ----------------------------------------------------------------
app.get('/api/cars', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        cars.id AS car_id,
        cars.brand,
        cars.model,
        cars.year,
        cars.price,
        cars.status,
        carimages.id AS image_id,
        carimages.image_url
      FROM cars
      LEFT JOIN carimages ON cars.id = carimages.car_id
      ORDER BY cars.id DESC
    `);

    const cars = {};

    rows.forEach(r => {
      if (!cars[r.car_id]) {
        cars[r.car_id] = {
          id: r.car_id,
          brand: r.brand,
          model: r.model,
          year: r.year,
          price: r.price,
          status: r.status,
          images: []
        };
      }

      if (r.image_url) {
        cars[r.car_id].images.push({
          id: r.image_id,
          url: r.image_url
        });
      }
    });

    res.json(Object.values(cars));
  } catch (err) {
    console.error('Cars list error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// ----------------------------------------------------------------
//   داشبورد مدیر (با id عکس برای حذف)
// ----------------------------------------------------------------
app.get('/api/admin/dashboard', authRequired, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        cars.id AS car_id,
        cars.brand,
        cars.model,
        cars.year,
        cars.price,
        cars.status,
        carimages.id AS image_id,
        carimages.image_url
      FROM cars
      LEFT JOIN carimages ON cars.id = carimages.car_id
      ORDER BY cars.id DESC
    `);

    const cars = {};

    rows.forEach(r => {
      if (!cars[r.car_id]) {
        cars[r.car_id] = {
          id: r.car_id,
          brand: r.brand,
          model: r.model,
          year: r.year,
          price: r.price,
          status: r.status,
          images: []
        };
      }

      if (r.image_url) {
        cars[r.car_id].images.push({
          id: r.image_id,
          url: r.image_url
        });
      }
    });

    res.json({
      message: "پنل مدیر",
      cars: Object.values(cars)
    });

  } catch (err) {
    console.error("Admin Dashboard Error:", err);
    return res.status(500).json({ error: "DB error" });
  }
});


// ----------------------------------------------------------------
//   داشبورد مشتری
// ----------------------------------------------------------------
app.get('/api/customer/dashboard', authRequired, customerOnly, async (req, res) => {
  res.json({ message: 'پنل مشتری', user: req.user });
});

// ---------------------------
// Start Server
// ---------------------------
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
