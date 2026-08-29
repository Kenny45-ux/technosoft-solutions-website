-- admin_schema.sql — additive migration for the Admin Panel.
-- Every statement is either IF NOT EXISTS or checks for the column first,
-- so this is safe to run against your existing database. Nothing here
-- touches or renames your existing tables/columns.
--
-- Run this in phpMyAdmin's SQL tab against the `technosoft` database.

-- ── Products: draft/published workflow + scheduled promotions ──────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS status ENUM('draft','published') NOT NULL DEFAULT 'published' AFTER is_best_seller,
  ADD COLUMN IF NOT EXISTS promo_start DATE NULL AFTER discount_percent,
  ADD COLUMN IF NOT EXISTS promo_end DATE NULL AFTER promo_start;

-- ── Product images: which image is the primary/cover image ─────────
ALTER TABLE product_images
  ADD COLUMN IF NOT EXISTS is_primary TINYINT(1) NOT NULL DEFAULT 0 AFTER image_url;

-- ── Support tickets: assign to a staff member ───────────────────────
-- (Plain column, no FK constraint here — MySQL/MariaDB versions differ on
-- "ADD CONSTRAINT IF NOT EXISTS" support, and the column alone is enough
-- for the admin panel to work. Add a real FK later by hand if you want it.)
ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS assigned_agent_id INT UNSIGNED NULL AFTER customer_id;

-- ── Blog ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  excerpt VARCHAR(400) NULL,
  content LONGTEXT NOT NULL,
  featured_image VARCHAR(500) NULL,
  category_id INT NULL,
  author_id INT UNSIGNED NULL,
  tags VARCHAR(300) NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Social media integration (credentials/tokens, never sent to frontend) ──
CREATE TABLE IF NOT EXISTS social_integrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform ENUM('facebook','instagram','linkedin','twitter') NOT NULL UNIQUE,
  connected TINYINT(1) NOT NULL DEFAULT 0,
  access_token TEXT NULL,
  page_id VARCHAR(100) NULL,
  last_synced_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform ENUM('facebook','instagram','linkedin','twitter') NOT NULL,
  external_post_id VARCHAR(150) NOT NULL,
  content TEXT NULL,
  media_url VARCHAR(500) NULL,
  post_url VARCHAR(500) NULL,
  published_at TIMESTAMP NULL,
  retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_platform_post (platform, external_post_id)
);

-- ── Admin accountability log ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  action VARCHAR(150) NOT NULL,
  details TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);
