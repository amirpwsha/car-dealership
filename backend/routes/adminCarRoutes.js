// backend/routes/adminCarRoutes.js

const express = require("express");
const router = express.Router();
const db = require("../db");
const { authRequired, adminOnly } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// ===============================
// تنظیمات آپلود عکس
// ===============================
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

// ===============================
// 1) افزودن خودرو + عکس
// ===============================
router.post(
  "/cars",
  authRequired,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    const brand = req.body.brand;
    const model = req.body.model;
    const year = req.body.year;

    // قیمت را از اشتباهات پاک می‌کنیم
    const price = req.body.price.toString().replace(/,/g, "");

    if (!brand || !model || !year || !price) {
      return res.status(400).json({ error: "تمام فیلدها لازم است" });
    }

    const imageUrl = req.file ? "images/" + req.file.filename : null;

    db.query(
      "INSERT INTO cars (brand, model, year, price, status) VALUES (?, ?, ?, ?, 'available')",
      [brand, model, year, price],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "DB Error" });
        }

        const carId = result.insertId;

        if (!imageUrl) {
          return res.json({ message: "خودرو اضافه شد (بدون عکس)" });
        }

        // ثبت عکس
        db.query(
          "INSERT INTO carimages (car_id, image_url) VALUES (?, ?)",
          [carId, imageUrl],
          (err2) => {
            if (err2) return res.status(500).json({ error: "خطا در ثبت عکس" });

            res.json({ message: "خودرو با موفقیت اضافه شد" });
          }
        );
      }
    );
  }
);

// ===============================
// 2) حذف خودرو + عکس‌ها
// ===============================
router.delete("/cars/:id", authRequired, adminOnly, (req, res) => {
  const carId = req.params.id;

  db.query("DELETE FROM carimages WHERE car_id=?", [carId], (err) => {
    if (err) return res.status(500).json({ error: "خطا در حذف عکس‌ها" });

    db.query("DELETE FROM cars WHERE id=?", [carId], (err2) => {
      if (err2) return res.status(500).json({ error: "خطا در حذف خودرو" });

      return res.json({ message: "خودرو با موفقیت حذف شد" });
    });
  });
});

// ===============================
// 3) ویرایش اطلاعات خودرو
// ===============================
router.put("/cars/:id", authRequired, adminOnly, (req, res) => {
  const carId = req.params.id;
  const { brand, model, year, price, status } = req.body;

  db.query(
    `
    UPDATE cars 
      SET brand=?, model=?, year=?, price=?, status=?
    WHERE id=?
    `,
    [brand, model, year, price, status, carId],
    (err) => {
      if (err) return res.status(500).json({ error: "خطا در ویرایش خودرو" });

      res.json({ message: "خودرو با موفقیت ویرایش شد" });
    }
  );
});

// ===============================
// 4) افزودن عکس جدید برای خودرو
// ===============================
router.post(
  "/cars/:id/image",
  authRequired,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    const carId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: "فایلی ارسال نشده است" });
    }

    const imageUrl = "images/" + req.file.filename;

    db.query(
      "INSERT INTO carimages (car_id, image_url) VALUES (?, ?)",
      [carId, imageUrl],
      (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "خطا در ذخیره عکس" });
        }

        res.json({ message: "عکس با موفقیت اضافه شد", imageUrl });
      }
    );
  }
);

// ===============================
// 5) حذف عکس
// ===============================
router.delete("/cars/image/:imageId", authRequired, adminOnly, (req, res) => {
  const imgId = req.params.imageId;

  db.query("DELETE FROM carimages WHERE id=?", [imgId], (err) => {
    if (err) return res.status(500).json({ error: "خطا در حذف عکس" });

    res.json({ message: "عکس حذف شد" });
  });
});

// ===============================
// 6) علامت‌گذاری خودرو به عنوان فروخته‌شده
// ===============================
router.post("/cars/:id/mark-sold", authRequired, adminOnly, (req, res) => {
  const carId = req.params.id;

  db.query(
    "UPDATE cars SET status='sold' WHERE id=?",
    [carId],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "خطا در تغییر وضعیت خودرو" });
      }

      res.json({ message: "خودرو به عنوان فروخته‌شده علامت‌گذاری شد" });
    }
  );
});

module.exports = router;
