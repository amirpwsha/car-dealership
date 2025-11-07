-- docs/database.sql
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','customer') DEFAULT 'customer'
);

CREATE TABLE IF NOT EXISTS Cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(50),
  model VARCHAR(50),
  year INT,
  price DECIMAL(10,2),
  status ENUM('available','sold') DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS PurchaseRequests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  car_id INT,
  request_date DATE,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (car_id) REFERENCES Cars(id)
);

-- جدول کاربران (برای ثبت‌نام و ورود)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول خودروها
CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('available', 'sold') DEFAULT 'available'
);

-- جدول عکس‌های خودرو
CREATE TABLE IF NOT EXISTS carimages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  car_id INT,
  image_url VARCHAR(255),
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- درج داده نمونه برای تست
INSERT INTO cars (brand, model, year, price, status) VALUES
('BMW', '320i', 2019, 45000.00, 'available'),
('Peugeot', '206', 2015, 11000.00, 'sold'),
('Toyota', 'Corolla', 2020, 18000.00, 'available');

INSERT INTO carimages (car_id, image_url) VALUES
(1, 'images/bmw320i.png'),
(2, 'images/peugeot206.png'),
(3, 'images/toyotacorolla.png');

-- درج کاربر نمونه برای تست ورود
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@khodro90.com', '$2a$10$OJF5HiV2yuzSc1uFhU9e1e.YYJxKklJw8dEkzE/VtR1geDCtI.Q2G', 'admin');
-- (رمز هش‌شده مربوط به: admin123)

