const express = require("express");
const router = express.Router();
const db = require("../db");
const path = require("path");
const multer = require("multer");
const { authRequired, adminOnly } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../frontend/images"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// ==============================
//   افزودن خودرو جدید
//   POST /api/admin/cars
// ==============================
router.post("/", authRequired, adminOnly, upload.single("image"), (req, res) => {
  const { brand, model, year } = req.body;
  let price = req.body.price;

  if (!brand || !model || !year || !price)
    return res.status(400).json({ error: "تمام فیلدها مورد نیاز است" });

  price = price.toString().replace(/,/g, "");

  const imageUrl = req.file ? "images/" + req.file.filename : null;

  db.query(
    "INSERT INTO cars (brand, model, year, price, status) VALUES (?, ?, ?, ?, 'available')",
    [brand, model, year, price],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });

      const carId = result.insertId;

      if (!imageUrl)
        return res.json({ message: "خودرو اضافه شد (بدون عکس)" });

      db.query(
        "INSERT INTO carimages (car_id, image_url) VALUES (?, ?)",
        [carId, imageUrl],
        err2 => {
          if (err2) return res.status(500).json({ error: "خطا در ذخیره عکس" });

          return res.json({ message: "خودرو با موفقیت اضافه شد" });
        }
      );
    }
  );
});


// ==============================
//   علامت‌گذاری فروخته‌شده
//   POST /api/admin/cars/:id/mark-sold
// ==============================
router.post("/:id/mark-sold", authRequired, adminOnly, (req, res) => {
  const carId = req.params.id;

  db.query(
    "UPDATE cars SET status='sold' WHERE id=?",
    [carId],
    err => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "وضعیت خودرو به فروخته‌شده تغییر کرد" });
    }
  );
});


// ==============================
//   ویرایش خودرو
//   PUT /api/admin/cars/:id
// ==============================
router.put("/:id", authRequired, adminOnly, (req, res) => {
  const carId = req.params.id;

  const {
    brand,
    model,
    year,
    price,
    status,
    mileage,
    gearbox,
    fuel,
    trim,
    color,
    interior_color,
    body_condition,
    engiine,
    chassis,
    origin,
    description
  } = req.body;

  db.query(
    `
    UPDATE cars 
      SET 
        brand=?,
        model=?,
        year=?,
        price=?,
        status=?,
        mileage=?,
        gearbox=?,
        fuel=?,
        trim=?,
        color=?,
        interior_color=?,
        body_condition=?,
        engiine=?,
        chassis=?,
        origin=?,
        description=?
    WHERE id=?
    `,
    [
      brand,
      model,
      year,
      price,
      status,
      mileage || null,
      gearbox || null,
      fuel || null,
      trim || null,
      color || null,
      interior_color || null,
      body_condition || null,
      engiine || null,
      chassis || null,
      origin || null,
      description || null,
      carId
    ],
    err => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "خطا در بروزرسانی خودرو" });
      }
      res.json({ message: "خودرو با موفقیت ویرایش شد" });
    }
  );
});


// ==============================
//   افزودن عکس
//   POST /api/admin/cars/:id/image
// ==============================
router.post("/:id/image", authRequired, adminOnly, upload.single("image"), (req, res) => {
  const carId = req.params.id;

  if (!req.file)
    return res.status(400).json({ error: "هیچ فایلی ارسال نشده" });

  const imageUrl = "images/" + req.file.filename;

  db.query(
    "INSERT INTO carimages (car_id, image_url) VALUES (?, ?)",
    [carId, imageUrl],
    err => {
      if (err) return res.status(500).json({ error: "DB error" });

      res.json({ message: "عکس اضافه شد", imageUrl });
    }
  );
});


// ==============================
//   حذف عکس
//   DELETE /api/admin/cars/image/:id
// ==============================
router.delete("/image/:id", authRequired, adminOnly, (req, res) => {
  const imageId = req.params.id;

  db.query(
    "DELETE FROM carimages WHERE id=?",
    [imageId],
    err => {
      if (err) return res.status(500).json({ error: "DB error" });

      res.json({ message: "عکس حذف شد" });
    }
  );
});


// ==============================
//   حذف خودرو
//   DELETE /api/admin/cars/:id
// ==============================
// ==============================
//   حذف خودرو
//   DELETE /api/admin/cars/:id
// ==============================
router.delete("/:id", authRequired, adminOnly, (req, res) => {
  const carId = req.params.id;

  // 1) اول حذف درخواست‌های خرید مرتبط با این خودرو
  db.query("DELETE FROM PurchaseRequests WHERE car_id = ?", [carId], (errReq) => {
    if (errReq) {
      console.error("Error deleting purchase requests:", errReq);
      return res.status(500).json({ error: "خطا در حذف درخواست‌های خرید" });
    }

    // 2) بعد حذف عکس‌های این خودرو
    db.query("DELETE FROM carimages WHERE car_id = ?", [carId], (errImg) => {
      if (errImg) {
        console.error("Error deleting car images:", errImg);
        return res.status(500).json({ error: "خطا در حذف عکس‌ها" });
      }

      // 3) در نهایت حذف خود خودرو
      db.query("DELETE FROM cars WHERE id = ?", [carId], (errCar) => {
        if (errCar) {
          console.error("Error deleting car:", errCar);
          return res.status(500).json({ error: "خطا در حذف خودرو" });
        }

        return res.json({ message: "خودرو و اطلاعات مرتبط با موفقیت حذف شد" });
      });
    });
  });
});

module.exports = router;
