CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('florist','supplier','admin') NOT NULL DEFAULT 'florist',
  role_assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role_valid_until DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS florists (
  florist_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_florists_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 4.50,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_suppliers_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flowers (
  flower_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  season_start TINYINT NULL,
  season_end TINYINT NULL,
  availability ENUM('in_stock','limited','unavailable') NOT NULL DEFAULT 'in_stock',
  offer_start DATE NULL,
  offer_end DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_flowers_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  florist_id INT NOT NULL,
  ordered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivery_date DATE NULL,
  status ENUM('processing','confirmed','delivered','cancelled') NOT NULL DEFAULT 'processing',
  total_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_florist FOREIGN KEY (florist_id) REFERENCES florists(florist_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  flower_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  item_total DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_flower FOREIGN KEY (flower_id) REFERENCES flowers(flower_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS supplier_ratings (
  rating_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  florist_id INT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_supplier_ratings_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
  CONSTRAINT fk_supplier_ratings_florist FOREIGN KEY (florist_id) REFERENCES florists(florist_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS recommendations (
  rec_id INT AUTO_INCREMENT PRIMARY KEY,
  florist_id INT NOT NULL,
  flower_id INT NOT NULL,
  season VARCHAR(20) NOT NULL,
  suggested_qty INT NOT NULL,
  computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recommendations_florist FOREIGN KEY (florist_id) REFERENCES florists(florist_id) ON DELETE CASCADE,
  CONSTRAINT fk_recommendations_flower FOREIGN KEY (flower_id) REFERENCES flowers(flower_id) ON DELETE CASCADE
);

CREATE INDEX idx_flowers_supplier_id ON flowers(supplier_id);
CREATE INDEX idx_orders_florist_id ON orders(florist_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_flower_id ON order_items(flower_id);
CREATE INDEX idx_recommendations_florist_id ON recommendations(florist_id);
