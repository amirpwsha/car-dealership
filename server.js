// server.js
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// اجازه به اپ برای خواندن JSON از body
app.use(express.json());
// اجازه به اپ برای خواندن داده‌های فرم (برای بعد)
app.use(express.urlencoded({ extended: true }));

// پوشه‌ی استاتیک برای فایل‌های frontend (صفحات HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// یک route ساده برای تست
app.get('/', (req, res) => {
  res.send('سامانه بنگاه معاملات خودرو - جلسه اول (سرور اجرا شد)');
});

// یک مثال API برای لیست خودروها (فعلاً دادهٔ نمونه)
app.get('/api/cars', (req, res) => {
  const sampleCars = [
    { id: 1, brand: 'Ford', model: 'Mustang', year: 2018, price: 35000 },
    { id: 2, brand: 'Toyota', model: 'Corolla', year: 2016, price: 12000 }
  ];
  res.json(sampleCars);
});

app.listen(port, () => {
  console.log("Server is running on http://localhost:" + port);
});