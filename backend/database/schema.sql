CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ============================================================
-- Rosena Fashion Store - PostgreSQL Database Schema
-- Version: 1.0
-- Description: Complete database schema with delivery system
-- ============================================================

-- Set client encoding
SET client_encoding = 'UTF8';

-- Create ENUM types (PostgreSQL requires these to be defined first)
DROP TYPE IF EXISTS delivery_method_type CASCADE;
CREATE TYPE delivery_method_type AS ENUM ('pickup', 'standard', 'express');

DROP TYPE IF EXISTS order_status_type CASCADE;
CREATE TYPE order_status_type AS ENUM (
  'pending', 'confirmed', 'paid', 'processing', 'packed', 
  'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'
);

DROP TYPE IF EXISTS payment_status_type CASCADE;
CREATE TYPE payment_status_type AS ENUM ('pending', 'paid', 'failed', 'refunded');

DROP TYPE IF EXISTS payment_method_type CASCADE;
CREATE TYPE payment_method_type AS ENUM ('mpesa', 'cash_on_delivery', 'bank_transfer', 'card');

DROP TYPE IF EXISTS discount_type CASCADE;
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

DROP TYPE IF EXISTS admin_role_type CASCADE;
CREATE TYPE admin_role_type AS ENUM ('super_admin', 'admin', 'staff');

-- ============================================================
-- 1. DELIVERY ZONES TABLE
-- ============================================================
DROP TABLE IF EXISTS delivery_zones CASCADE;

CREATE TABLE delivery_zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  max_distance_km DECIMAL(10,2) NOT NULL,
  standard_cost DECIMAL(10,2) NOT NULL,
  express_cost DECIMAL(10,2) NOT NULL,
  estimated_days VARCHAR(20) DEFAULT '2-5 days',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_delivery_zones_active ON delivery_zones(active);
CREATE INDEX idx_delivery_zones_max_distance ON delivery_zones(max_distance_km);

-- Add comments
COMMENT ON TABLE delivery_zones IS 'Delivery zones and pricing';
COMMENT ON COLUMN delivery_zones.name IS 'Zone name (e.g., "Nairobi CBD")';
COMMENT ON COLUMN delivery_zones.max_distance_km IS 'Maximum distance for this zone in kilometers';
COMMENT ON COLUMN delivery_zones.standard_cost IS 'Standard delivery cost in KSh';
COMMENT ON COLUMN delivery_zones.express_cost IS 'Express delivery cost in KSh';

-- Insert default delivery zones
INSERT INTO delivery_zones (name, max_distance_km, standard_cost, express_cost, estimated_days) VALUES
('Within Nairobi CBD', 5.00, 200.00, 400.00, '1-2 days'),
('Greater Nairobi', 15.00, 350.00, 600.00, '2-3 days'),
('Nairobi County', 30.00, 500.00, 800.00, '2-5 days'),
('Neighboring Counties', 100.00, 800.00, 1200.00, '3-7 days'),
('Upcountry Kenya', 500.00, 1000.00, 1500.00, '5-10 days');

-- ============================================================
-- 2. CUSTOMER ADDRESSES TABLE
-- ============================================================
DROP TABLE IF EXISTS customer_addresses CASCADE;

CREATE TABLE customer_addresses (
  id SERIAL PRIMARY KEY,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  address_label VARCHAR(50) DEFAULT 'Home',
  full_address TEXT NOT NULL,
  building_name VARCHAR(100),
  street VARCHAR(100),
  area VARCHAR(100),
  city VARCHAR(50) DEFAULT 'Nairobi',
  postal_code VARCHAR(10),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  delivery_notes TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_customer_addresses_phone ON customer_addresses(customer_phone);
CREATE INDEX idx_customer_addresses_is_default ON customer_addresses(is_default);
CREATE INDEX idx_customer_addresses_coordinates ON customer_addresses(latitude, longitude);

COMMENT ON TABLE customer_addresses IS 'Customer delivery addresses';
COMMENT ON COLUMN customer_addresses.latitude IS 'GPS latitude';
COMMENT ON COLUMN customer_addresses.longitude IS 'GPS longitude';

-- ============================================================
-- 3. PRODUCTS TABLE
-- ============================================================
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(500),
  weight_kg DECIMAL(5,2) DEFAULT 0.50,
  stock_quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_slug ON products(slug);

COMMENT ON TABLE products IS 'Products catalog';
COMMENT ON COLUMN products.weight_kg IS 'Product weight in kilograms';

-- Insert sample products
INSERT INTO products (name, slug, description, price, category, weight_kg, stock_quantity) VALUES
('Official Shirts', 'official-shirts', 'Quality formal shirts for office wear', 2000.00, 'Shirts', 0.30, 50),
('African Shirts', 'african-shirts', 'Authentic African print shirts', 1700.00, 'Shirts', 0.35, 40),
('Princess Round Dress', 'princess-round-dress', 'Elegant princess style dress', 4000.00, 'Dresses', 0.60, 30),
('Ankara Design Shirt', 'ankara-design-shirt', 'Stylish Ankara design shirt', 3000.00, 'Shirts', 0.35, 45),
('Full-Length Abaya', 'full-length-abaya', 'Traditional full-length Abaya', 2500.00, 'Kaftans', 0.70, 25),
('Blouse & Skirt Set', 'blouse-skirt-set', 'Matching blouse and skirt set', 2000.00, 'Sets', 0.55, 35),
('Cinderella Long Dress', 'cinderella-long-dress', 'Beautiful long evening dress', 4000.00, 'Dresses', 0.80, 20),
('Full-Length Abaya Kaftans', 'abaya-kaftans', 'Premium Abaya Kaftans collection', 2300.00, 'Kaftans', 0.75, 30),
('Heavy Duty Reflector Jackets', 'reflector-jackets', 'Safety reflector jackets', 1500.00, 'Jackets', 0.90, 60),
('Kitenge Bag', 'kitenge-bag', 'Handcrafted Kitenge bags', 1800.00, 'Accessories', 0.20, 100);

-- ============================================================
-- 4. CUSTOMERS TABLE
-- ============================================================
DROP TABLE IF EXISTS customers CASCADE;

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  whatsapp_name VARCHAR(100),
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  last_order_date TIMESTAMP,
  customer_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_is_active ON customers(is_active);

COMMENT ON TABLE customers IS 'Customer information';
COMMENT ON COLUMN customers.whatsapp_name IS 'Name from WhatsApp profile';

-- ============================================================
-- 5. ORDERS TABLE
-- ============================================================
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100),
  
  -- Delivery Information
  delivery_method delivery_method_type NOT NULL DEFAULT 'standard',
  delivery_address_id INT,
  delivery_address TEXT,
  delivery_latitude DECIMAL(10,8),
  delivery_longitude DECIMAL(11,8),
  delivery_notes TEXT,
  distance_km DECIMAL(10,2),
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Order Status
  status order_status_type NOT NULL DEFAULT 'pending',
  payment_status payment_status_type DEFAULT 'pending',
  payment_method payment_method_type,
  payment_reference VARCHAR(100),
  
  -- Courier Information
  courier_service VARCHAR(50),
  tracking_number VARCHAR(100),
  courier_reference VARCHAR(100),
  
  -- Timestamps
  confirmed_at TIMESTAMP,
  paid_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key
  CONSTRAINT fk_delivery_address FOREIGN KEY (delivery_address_id) 
    REFERENCES customer_addresses(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_delivery_method ON orders(delivery_method);
CREATE INDEX idx_orders_customer_status ON orders(customer_phone, status);
CREATE INDEX idx_orders_date_status ON orders(created_at, status);

COMMENT ON TABLE orders IS 'Customer orders';
COMMENT ON COLUMN orders.order_number IS 'Unique order number (e.g., RF-12345)';
COMMENT ON COLUMN orders.distance_km IS 'Distance from store to customer';
COMMENT ON COLUMN orders.payment_reference IS 'M-PESA code or transaction reference';

-- ============================================================
-- 6. ORDER ITEMS TABLE
-- ============================================================
DROP TABLE IF EXISTS order_items CASCADE;

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  weight_kg DECIMAL(5,2) DEFAULT 0.50,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_order FOREIGN KEY (order_id) 
    REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_product FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE RESTRICT
);

-- Create indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);

COMMENT ON TABLE order_items IS 'Individual items in orders';
COMMENT ON COLUMN order_items.product_name IS 'Snapshot of product name';
COMMENT ON COLUMN order_items.product_price IS 'Price at time of order';

-- ============================================================
-- 7. ORDER STATUS HISTORY TABLE
-- ============================================================
DROP TABLE IF EXISTS order_status_history CASCADE;

CREATE TABLE order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  changed_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_order_history FOREIGN KEY (order_id) 
    REFERENCES orders(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at);

COMMENT ON TABLE order_status_history IS 'Order status change tracking';
COMMENT ON COLUMN order_status_history.changed_by IS 'admin username or system';

-- ============================================================
-- 8. SHIPPING SETTINGS TABLE
-- ============================================================
DROP TABLE IF EXISTS shipping_settings CASCADE;

CREATE TABLE shipping_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_shipping_settings_key ON shipping_settings(setting_key);

COMMENT ON TABLE shipping_settings IS 'Configurable shipping settings';

-- Insert default shipping settings
INSERT INTO shipping_settings (setting_key, setting_value, description) VALUES
('free_shipping_threshold', '10000', 'Order value for free shipping (KSh)'),
('weight_surcharge_threshold', '5', 'Weight threshold for surcharge (kg)'),
('weight_surcharge_per_kg', '50', 'Additional cost per kg above threshold (KSh)'),
('store_latitude', '-1.2921', 'Store location latitude'),
('store_longitude', '36.8219', 'Store location longitude'),
('store_address', 'Nairobi CBD, Kenya', 'Store physical address'),
('enable_cod', 'true', 'Enable Cash on Delivery'),
('cod_fee', '50', 'Cash on Delivery fee (KSh)'),
('enable_express_delivery', 'true', 'Enable express delivery option'),
('max_delivery_distance', '500', 'Maximum delivery distance (km)');

-- ============================================================
-- 9. CART TABLE
-- ============================================================
DROP TABLE IF EXISTS cart CASCADE;

CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  customer_phone VARCHAR(20) NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT unique_cart_item UNIQUE (customer_phone, product_id)
);

-- Create indexes
CREATE INDEX idx_cart_customer_phone ON cart(customer_phone);
CREATE INDEX idx_cart_product_id ON cart(product_id);

COMMENT ON TABLE cart IS 'Shopping cart items';

-- ============================================================
-- 10. COURIER SERVICES TABLE
-- ============================================================
DROP TABLE IF EXISTS courier_services CASCADE;

CREATE TABLE courier_services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  api_endpoint VARCHAR(500),
  api_key VARCHAR(200),
  is_active BOOLEAN DEFAULT TRUE,
  supports_tracking BOOLEAN DEFAULT TRUE,
  min_distance DECIMAL(10,2) DEFAULT 0.00,
  max_distance DECIMAL(10,2) DEFAULT 500.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_courier_services_name ON courier_services(name);
CREATE INDEX idx_courier_services_is_active ON courier_services(is_active);

COMMENT ON TABLE courier_services IS 'Third-party courier services';
COMMENT ON COLUMN courier_services.api_key IS 'Encrypted API key';
COMMENT ON COLUMN courier_services.min_distance IS 'Minimum distance in km';
COMMENT ON COLUMN courier_services.max_distance IS 'Maximum distance in km';

-- Insert default courier services
INSERT INTO courier_services (name, is_active, supports_tracking, max_distance) VALUES
('Sendy', TRUE, TRUE, 100.00),
('Glovo', TRUE, TRUE, 50.00),
('In-House Delivery', TRUE, FALSE, 30.00),
('Posta Kenya', FALSE, TRUE, 500.00);

-- ============================================================
-- 11. PROMOTIONS TABLE
-- ============================================================
DROP TABLE IF EXISTS promotions CASCADE;

CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0.00,
  max_discount DECIMAL(10,2),
  applies_to_shipping BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

COMMENT ON TABLE promotions IS 'Promotional codes';
COMMENT ON COLUMN promotions.code IS 'Promo code';
COMMENT ON COLUMN promotions.usage_limit IS 'Total usage limit';
COMMENT ON COLUMN promotions.max_discount IS 'Max discount amount';

-- ============================================================
-- 12. ADMIN USERS TABLE
-- ============================================================
DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role admin_role_type DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);

COMMENT ON TABLE admin_users IS 'Admin users';

-- ============================================================
-- VIEWS
-- ============================================================

-- View: Order Summary
DROP VIEW IF EXISTS v_order_summary;
CREATE VIEW v_order_summary AS
SELECT 
  o.id,
  o.order_number,
  o.customer_name,
  o.customer_phone,
  o.delivery_method,
  o.delivery_address,
  o.distance_km,
  o.subtotal,
  o.shipping_cost,
  o.total_amount,
  o.status,
  o.payment_status,
  o.tracking_number,
  o.created_at,
  o.delivered_at,
  COUNT(oi.id) as total_items,
  SUM(oi.quantity) as total_quantity
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.customer_name, o.customer_phone, 
         o.delivery_method, o.delivery_address, o.distance_km, 
         o.subtotal, o.shipping_cost, o.total_amount, o.status, 
         o.payment_status, o.tracking_number, o.created_at, o.delivered_at;

-- View: Customer Orders
DROP VIEW IF EXISTS v_customer_orders;
CREATE VIEW v_customer_orders AS
SELECT 
  c.phone,
  c.name,
  c.email,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as total_spent,
  MAX(o.created_at) as last_order_date,
  AVG(o.total_amount) as avg_order_value
FROM customers c
LEFT JOIN orders o ON c.phone = o.customer_phone AND o.status != 'cancelled'
GROUP BY c.phone, c.name, c.email;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function: Calculate Order Total Weight
CREATE OR REPLACE FUNCTION calculate_order_weight(order_id_param INT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_weight DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(oi.weight_kg * oi.quantity), 0)
  INTO total_weight
  FROM order_items oi
  WHERE oi.order_id = order_id_param;
  
  RETURN total_weight;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Shipping Cost
CREATE OR REPLACE FUNCTION get_shipping_cost(
  distance_param DECIMAL(10,2),
  order_total_param DECIMAL(10,2),
  delivery_speed_param VARCHAR(20)
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  shipping_cost DECIMAL(10,2);
  free_threshold DECIMAL(10,2);
BEGIN
  -- Get free shipping threshold
  SELECT CAST(setting_value AS DECIMAL(10,2)) INTO free_threshold
  FROM shipping_settings
  WHERE setting_key = 'free_shipping_threshold';
  
  -- Check if eligible for free shipping
  IF order_total_param >= free_threshold THEN
    RETURN 0;
  END IF;
  
  -- Get cost based on distance and speed
  IF delivery_speed_param = 'express' THEN
    SELECT express_cost INTO shipping_cost
    FROM delivery_zones
    WHERE active = TRUE AND distance_param <= max_distance_km
    ORDER BY max_distance_km ASC
    LIMIT 1;
  ELSE
    SELECT standard_cost INTO shipping_cost
    FROM delivery_zones
    WHERE active = TRUE AND distance_param <= max_distance_km
    ORDER BY max_distance_km ASC
    LIMIT 1;
  END IF;
  
  RETURN COALESCE(shipping_cost, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger Function: Update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all relevant tables
CREATE TRIGGER tr_delivery_zones_updated_at BEFORE UPDATE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_cart_updated_at BEFORE UPDATE ON cart
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger Function: Update customer stats
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE customers
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total_amount,
      last_order_date = NEW.delivered_at
    WHERE phone = NEW.customer_phone;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_customer_stats
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_stats();

-- Trigger Function: Log order status changes
CREATE OR REPLACE FUNCTION log_order_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_log_order_status
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status();

-- ============================================================
-- GRANT PERMISSIONS (Optional - adjust as needed)
-- ============================================================

-- Grant all privileges to your application user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;

-- ============================================================
-- END OF SCHEMA
-- ============================================================

SELECT 'PostgreSQL database schema created successfully!' as message;