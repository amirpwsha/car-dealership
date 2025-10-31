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

CREATE TABLE IF NOT EXISTS CarImages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  car_id INT,
  image_url VARCHAR(255),
  FOREIGN KEY (car_id) REFERENCES Cars(id)
);
