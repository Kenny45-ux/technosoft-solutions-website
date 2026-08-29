-- ============================================================
-- Technosoft Solutions Zambia — Database Schema
-- ============================================================
-- CONTEXT: This project currently has NO backend or database —
-- the React/Vite app is entirely frontend, with product data
-- living in a static JS file and support tickets held only in
-- browser memory for the current session. There was nothing
-- existing to inspect or avoid duplicating; every table below
-- is NEW.
--
-- Charset/engine chosen for XAMPP/MySQL compatibility.
-- Run this in phpMyAdmin or the MySQL CLI against a fresh
-- `technosoft` database.
-- ============================================================

CREATE DATABASE IF NOT EXISTS technosoft
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE technosoft;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- USERS / CUSTOMERS
-- ============================================================

CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  phone         VARCHAR(30)  NULL,
  company       VARCHAR(150) NULL,
  password_hash VARCHAR(255) NOT NULL,          -- never store plaintext; hash server-side (bcrypt/argon2)
  role          ENUM('customer','agent','admin') NOT NULL DEFAULT 'customer',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ============================================================
-- PRODUCT CATALOG
-- ============================================================

CREATE TABLE categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE subcategories (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(100) NOT NULL,
  slug         VARCHAR(120) NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY uq_subcategories_slug (slug),
  INDEX idx_subcategories_category (category_id)
) ENGINE=InnoDB;

CREATE TABLE products (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku              VARCHAR(50)  NOT NULL,
  name             VARCHAR(200) NOT NULL,
  brand            VARCHAR(100) NULL,
  category_id      INT UNSIGNED NOT NULL,
  subcategory_id   INT UNSIGNED NULL,
  description      TEXT NULL,
  price            DECIMAL(10,2) NOT NULL,
  old_price        DECIMAL(10,2) NULL,           -- populated only when a genuine discount applies
  discount_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
  stock_quantity   INT UNSIGNED NOT NULL DEFAULT 0,
  stock_status     ENUM('in_stock','low_stock','out_of_stock','available_on_request')
                     NOT NULL DEFAULT 'in_stock',
  rating           DECIMAL(2,1) NULL,             -- e.g. 4.5
  reviews_count    INT UNSIGNED NOT NULL DEFAULT 0,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  is_new           BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
  UNIQUE KEY uq_products_sku (sku),
  INDEX idx_products_category (category_id),
  INDEX idx_products_stock_status (stock_status),
  INDEX idx_products_featured (is_featured)
) ENGINE=InnoDB;

-- One row per product photo; keeps the schema ready for real multi-angle galleries
CREATE TABLE product_images (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  image_url   VARCHAR(500) NOT NULL,
  sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_images_product (product_id)
) ENGINE=InnoDB;

-- Key/value spec rows, so different product categories can have entirely
-- different spec fields without needing separate tables per category.
CREATE TABLE product_specifications (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id   INT UNSIGNED NOT NULL,
  spec_label   VARCHAR(100) NOT NULL,   -- e.g. "Ports", "Warranty", "Fibre type"
  spec_value   VARCHAR(255) NOT NULL,   -- e.g. "4x Gigabit RJ45"
  sort_order   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_specs_product (product_id)
) ENGINE=InnoDB;

-- ============================================================
-- CART / WISHLIST
-- ============================================================

CREATE TABLE cart_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  quantity    INT UNSIGNED NOT NULL DEFAULT 1,
  saved_for_later BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_cart_user_product (user_id, product_id),
  INDEX idx_cart_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE wishlists (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  INDEX idx_wishlist_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number     VARCHAR(40) NOT NULL,          -- e.g. TS-8F3K2-419, generated server-side
  customer_id      INT UNSIGNED NOT NULL,
  order_status     ENUM('pending','confirmed','processing','delivered','cancelled')
                     NOT NULL DEFAULT 'pending',
  subtotal         DECIMAL(10,2) NOT NULL,
  delivery_fee     DECIMAL(10,2) NOT NULL DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  payment_status   ENUM('unpaid','paid','failed','refunded') NOT NULL DEFAULT 'unpaid',
  payment_method   ENUM('mobile_money','card','bank_transfer') NULL,
  delivery_address VARCHAR(500) NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  UNIQUE KEY uq_orders_number (order_number),
  INDEX idx_orders_customer (customer_id),
  INDEX idx_orders_status (order_status)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  quantity    INT UNSIGNED NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,     -- snapshot at time of order — price may change later
  subtotal    DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;

-- ============================================================
-- SERVICES / PARTNERS / QUOTES
-- ============================================================

CREATE TABLE services (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  blurb       VARCHAR(255) NULL,
  detail      TEXT NULL,
  icon_key    VARCHAR(50) NULL,      -- maps to a frontend icon component name
  sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE partners (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  logo_url    VARCHAR(500) NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,   -- true = shown in the curated Partners section, false = marquee only
  sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- "Request a Quote" / "Request IT Service" submissions
CREATE TABLE quotes (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NULL,           -- nullable: guests can request quotes without an account
  name         VARCHAR(150) NOT NULL,
  email        VARCHAR(190) NOT NULL,
  phone        VARCHAR(30) NULL,
  service_id   INT UNSIGNED NULL,
  message      TEXT NOT NULL,
  payment_pref ENUM('mobile_money','card','bank_transfer') NULL,
  status       ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  INDEX idx_quotes_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================

CREATE TABLE support_ticket_categories (
  id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE support_ticket_priorities (
  id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(20) NOT NULL UNIQUE,
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0   -- for ordering Low < Medium < High < Critical
) ENGINE=InnoDB;

CREATE TABLE support_ticket_statuses (
  id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE support_tickets (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_number     VARCHAR(40) NOT NULL,        -- e.g. TS-8F3K2-419, generated server-side on creation
  customer_id       INT UNSIGNED NOT NULL,
  category_id       TINYINT UNSIGNED NOT NULL,
  priority_id       TINYINT UNSIGNED NOT NULL,
  status_id         TINYINT UNSIGNED NOT NULL,
  subject           VARCHAR(200) NOT NULL,
  description       TEXT NOT NULL,
  assigned_agent_id INT UNSIGNED NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at       TIMESTAMP NULL,
  closed_at         TIMESTAMP NULL,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES support_ticket_categories(id),
  FOREIGN KEY (priority_id) REFERENCES support_ticket_priorities(id),
  FOREIGN KEY (status_id) REFERENCES support_ticket_statuses(id),
  FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_tickets_number (ticket_number),
  INDEX idx_tickets_customer (customer_id),
  INDEX idx_tickets_status (status_id),
  INDEX idx_tickets_priority (priority_id),
  INDEX idx_tickets_agent (assigned_agent_id),
  INDEX idx_tickets_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE support_ticket_messages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id   INT UNSIGNED NOT NULL,
  sender_id   INT UNSIGNED NOT NULL,
  sender_type ENUM('customer','agent') NOT NULL,
  message     TEXT NOT NULL,
  is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,  -- true = staff-only note, never shown to the customer
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  INDEX idx_ticket_messages_ticket (ticket_id)
) ENGINE=InnoDB;

CREATE TABLE support_ticket_attachments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id   INT UNSIGNED NOT NULL,
  message_id  INT UNSIGNED NULL,          -- nullable: an attachment can belong to the ticket itself, not a specific reply
  file_name   VARCHAR(255) NOT NULL,
  file_url    VARCHAR(500) NOT NULL,
  file_type   VARCHAR(100) NULL,
  file_size   INT UNSIGNED NULL,          -- bytes
  uploaded_by INT UNSIGNED NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (message_id) REFERENCES support_ticket_messages(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_ticket_attachments_ticket (ticket_id)
) ENGINE=InnoDB;

-- ============================================================
-- NOTIFICATIONS (generic — order updates, ticket replies, etc.)
-- ============================================================

CREATE TABLE notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  type        VARCHAR(50) NOT NULL,       -- e.g. "ticket_reply", "order_status"
  title       VARCHAR(200) NOT NULL,
  body        VARCHAR(500) NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_unread (user_id, is_read)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- REFERENCE / SEED DATA
-- These are lookup values only (categories, priorities, statuses)
-- — NOT fake customers, orders, tickets, or company statistics.
-- ============================================================

INSERT INTO support_ticket_categories (name) VALUES
  ('Technical Support'), ('Hardware'), ('Software'), ('Networking'),
  ('Cybersecurity'), ('Website/Application'), ('Account'), ('Billing'), ('Other');

INSERT INTO support_ticket_priorities (name, sort_order) VALUES
  ('Low', 1), ('Medium', 2), ('High', 3), ('Critical', 4);

INSERT INTO support_ticket_statuses (name) VALUES
  ('Open'), ('In Progress'), ('Waiting for Customer'), ('Resolved'), ('Closed');
