// backend/server.js
const express = require("express");
const path = require("path");
const db = require("./db");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRequestRoutes = require("./routes/adminRequestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminCarRoutes = require("./routes/adminCarRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const { authRequired, adminOnly, customerOnly } = require("./middleware/auth");

const app = express();
const port = 3000;

// ---------------------------
// Middleware
// ---------------------------
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// سرو استاتیک فرانت‌اند
app.use(express.static(path.join(__dirname, "../frontend")));

// سرو عکس‌ها
app.use("/images", express.static(path.join(__dirname, "../frontend/images")));

// ---------------------------
// Routes اصلی
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin/requests", adminRequestRoutes);

// روت‌های مدیریتی
app.use("/api/admin", adminRoutes);

// مدیریت خودروها زیر /api/admin/cars
app.use("/api/admin/cars", adminCarRoutes);

// داشبورد ادمین زیر /api/admin
app.use("/api/admin", dashboardRoutes);

// داشبورد مشتری
app.get("/api/customer/dashboard", authRequired, customerOnly, (req, res) => {
  res.json({ user: req.user });
});

// صفحه اصلی
app.get("/", (req, res) => {
  res.send("🚗 سرور خودرو۹۰ فعال است!");
});

// ================================
//  API: لیست همه خودروها
// ================================
app.get("/api/cars", async (req, res) => {
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
    console.error("Cars error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ================================
//  جستجو
// ================================
app.get("/api/cars/search", async (req, res) => {
  try {
    const { model, minPrice, maxPrice, minYear, maxYear } = req.query;

    let query = `
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
      WHERE 1=1
    `;

    const params = [];

    if (model) {
  query += `
    AND (
      cars.model LIKE ? 
      OR cars.brand LIKE ?
      OR CONCAT(cars.brand, ' ', cars.model) LIKE ?
    )
  `;
  params.push(`%${model}%`);
  params.push(`%${model}%`);
  params.push(`%${model}%`);
}
    if (minPrice) { query += " AND cars.price >= ?"; params.push(minPrice); }
    if (maxPrice) { query += " AND cars.price <= ?"; params.push(maxPrice); }
    if (minYear) { query += " AND cars.year >= ?"; params.push(minYear); }
    if (maxYear) { query += " AND cars.year <= ?"; params.push(maxYear); }

    query += " ORDER BY cars.id DESC";

    const [rows] = await db.promise().query(query, params);

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
    console.error("Search error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ================================
//  API: جزئیات کامل یک خودرو
// ================================
app.get("/api/cars/:id", async (req, res) => {
  try {
    const carId = req.params.id;

    const [rows] = await db.promise().query(`
      SELECT 
        cars.id AS id,
        cars.brand,
        cars.model,
        cars.year,
        cars.price,
        cars.status,
        cars.mileage,
        cars.gearbox,
        cars.fuel,
        cars.trim,
        cars.color,
        cars.interior_color,
        cars.body_condition,
        cars.engiine,
        cars.chassis,
        cars.origin,
        cars.description,
        carimages.image_url
      FROM cars
      LEFT JOIN carimages ON cars.id = carimages.car_id
      WHERE cars.id = ?
    `, [carId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "خودرو یافت نشد" });
    }

    const car = {
      id: rows[0].id,
      brand: rows[0].brand,
      model: rows[0].model,
      year: rows[0].year,
      price: rows[0].price,
      status: rows[0].status,
      mileage: rows[0].mileage,
      gearbox: rows[0].gearbox,
      fuel: rows[0].fuel,
      trim: rows[0].trim,
      color: rows[0].color,
      interior_color: rows[0].interior_color,
      body_condition: rows[0].body_condition,
      engiine: rows[0].engiine,
      chassis: rows[0].chassis,
      origin: rows[0].origin,
      description: rows[0].description,
      images: []
    };

    rows.forEach(r => {
      if (r.image_url) car.images.push(r.image_url);
    });

    res.json(car);

  } catch (err) {
    console.error("Car details error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ---------------------------
// Start server
// ---------------------------
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
