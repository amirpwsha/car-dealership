const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // اگر رمز داری وارد کن
  database: 'car_dealership'
});

connection.connect(err => {
  if (err) {
    console.error('❌ خطا در اتصال به دیتابیس:', err);
    return;
  }
  console.log('✅ اتصال به دیتابیس برقرار شد');
});

module.exports = connection;
