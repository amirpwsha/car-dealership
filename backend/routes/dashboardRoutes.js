// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authRequired, adminOnly } = require('../middleware/auth');

// 🔹 داشبورد ادمین
// مسیر نهایی: GET /api/admin/dashboard
router.get('/dashboard', authRequired, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
  SELECT 
    cars.id AS car_id,
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
  mileage: r.mileage,
  gearbox: r.gearbox,
  fuel: r.fuel,
  trim: r.trim,
  color: r.color,
  interior_color: r.interior_color,
  body_condition: r.body_condition,
  engiine: r.engiine,
  chassis: r.chassis,
  origin: r.origin,
  description: r.description,
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

    return res.json({ cars: Object.values(cars) });
  } catch (err) {
    console.error('Dashboard admin error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
