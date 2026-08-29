<?php
// admin_products.php — admin-only product management
//   GET    /api/admin_products.php            → all products (incl. drafts), with images
//   GET    /api/admin_products.php?id=5        → one product, with images
//   POST   /api/admin_products.php              → create a product
//   PUT    /api/admin_products.php?id=5         → update a product
//   DELETE /api/admin_products.php?id=5         → delete a product

require "cors.php";
require "db.php";
require "require_admin.php"; // sets $adminId, defines logAdminActivity(); 401/403s non-admins

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "
        SELECT p.*, c.name AS category, sc.name AS subcategory
        FROM products p
        JOIN categories c ON c.id = p.category_id
        LEFT JOIN subcategories sc ON sc.id = p.subcategory_id
    ";
    if (!empty($_GET['id'])) {
        $stmt = $pdo->prepare($sql . " WHERE p.id = ?");
        $stmt->execute([$_GET['id']]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$product) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            exit();
        }
        $imgStmt = $pdo->prepare("SELECT id, image_url, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC");
        $imgStmt->execute([$product['id']]);
        $product['images'] = $imgStmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($product);
        exit();
    }

    $stmt = $pdo->query($sql . " ORDER BY p.created_at DESC");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Attach each product's primary (or first) image — primary wins if set,
    // otherwise fall back to that product's earliest-added image.
    $imagesByProduct = [];
    foreach ($pdo->query("SELECT product_id, image_url FROM product_images WHERE is_primary = 1")->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $imagesByProduct[$row['product_id']] = $row['image_url'];
    }
    $fallbackStmt = $pdo->query("
        SELECT pi.product_id, pi.image_url
        FROM product_images pi
        INNER JOIN (SELECT product_id, MIN(id) AS min_id FROM product_images GROUP BY product_id) first_img
          ON first_img.product_id = pi.product_id AND first_img.min_id = pi.id
    ");
    foreach ($fallbackStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        if (!isset($imagesByProduct[$row['product_id']])) {
            $imagesByProduct[$row['product_id']] = $row['image_url'];
        }
    }
    foreach ($products as &$p) {
        $p['image'] = $imagesByProduct[$p['id']] ?? null;
    }
    echo json_encode($products);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $required = ['name', 'category_id', 'price', 'sku'];
    foreach ($required as $field) {
        if (empty($data[$field]) && $data[$field] !== '0') {
            http_response_code(400);
            echo json_encode(["error" => "Missing required field: $field"]);
            exit();
        }
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO products (
                sku, name, brand, category_id, subcategory_id, description,
                price, old_price, discount_percent, promo_start, promo_end,
                stock_quantity, stock_status, is_featured, is_new, is_best_seller, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['sku'], $data['name'], $data['brand'] ?? null,
            $data['category_id'], $data['subcategory_id'] ?? null, $data['description'] ?? null,
            $data['price'], $data['old_price'] ?? null, $data['discount_percent'] ?? 0,
            $data['promo_start'] ?? null, $data['promo_end'] ?? null,
            $data['stock_quantity'] ?? 0, $data['stock_status'] ?? 'in_stock',
            !empty($data['is_featured']) ? 1 : 0, !empty($data['is_new']) ? 1 : 0, !empty($data['is_best_seller']) ? 1 : 0,
            $data['status'] ?? 'published',
        ]);
        $productId = $pdo->lastInsertId();
        logAdminActivity($pdo, $adminId, 'Added product', $data['name']);
        echo json_encode(["id" => $productId, "success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'PUT') {
    if (empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Product id is required"]);
        exit();
    }
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        $stmt = $pdo->prepare("
            UPDATE products SET
                sku = ?, name = ?, brand = ?, category_id = ?, subcategory_id = ?, description = ?,
                price = ?, old_price = ?, discount_percent = ?, promo_start = ?, promo_end = ?,
                stock_quantity = ?, stock_status = ?, is_featured = ?, is_new = ?, is_best_seller = ?, status = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $data['sku'], $data['name'], $data['brand'] ?? null,
            $data['category_id'], $data['subcategory_id'] ?? null, $data['description'] ?? null,
            $data['price'], $data['old_price'] ?? null, $data['discount_percent'] ?? 0,
            $data['promo_start'] ?? null, $data['promo_end'] ?? null,
            $data['stock_quantity'] ?? 0, $data['stock_status'] ?? 'in_stock',
            !empty($data['is_featured']) ? 1 : 0, !empty($data['is_new']) ? 1 : 0, !empty($data['is_best_seller']) ? 1 : 0,
            $data['status'] ?? 'published',
            $_GET['id'],
        ]);
        logAdminActivity($pdo, $adminId, 'Edited product', $data['name'] ?? "#{$_GET['id']}");
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'DELETE') {
    if (empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Product id is required"]);
        exit();
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        logAdminActivity($pdo, $adminId, 'Deleted product', "#{$_GET['id']}");
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
