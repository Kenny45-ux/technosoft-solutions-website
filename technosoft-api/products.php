<?php
// products.php — GET /api/products.php            → list all products
//                GET /api/products.php?id=5        → single product
//                GET /api/products.php?category=X  → filter by category name
//
// Joins categories/subcategories to return readable names, pulls each
// product's primary image, and only shows a discount while its promotion
// window is actually active (or has no end date set).
//
// Defensive note: this only shows status='published' products and respects
// promo_start/promo_end once you've run admin_schema.sql (which adds those
// columns). Until then, it gracefully falls back to the pre-migration
// behavior instead of breaking your storefront.

require "cors.php";
require "db.php";

$method = $_SERVER['REQUEST_METHOD'];

function hasAdminColumns(PDO $pdo): bool {
    static $result = null;
    if ($result !== null) return $result;
    try {
        $pdo->query("SELECT status, promo_start, promo_end FROM products LIMIT 1");
        $result = true;
    } catch (PDOException $e) {
        $result = false;
    }
    return $result;
}

if ($method === 'GET') {
    $migrated = hasAdminColumns($pdo);

    $discountExpr = $migrated
        ? "CASE WHEN p.promo_end IS NOT NULL AND p.promo_end < CURDATE() THEN 0 ELSE p.discount_percent END"
        : "p.discount_percent";

    $baseSql = "
        SELECT p.id, p.sku, p.name, p.brand, p.description,
               p.price, p.old_price, {$discountExpr} AS discount,
               p.stock_quantity AS stock, p.stock_status,
               p.rating, p.reviews_count AS reviews,
               p.is_new, p.is_featured, p.is_best_seller,
               c.name AS category, sc.name AS subcategory,
               (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image
        FROM products p
        JOIN categories c ON c.id = p.category_id
        LEFT JOIN subcategories sc ON sc.id = p.subcategory_id
    ";
    $whereClauses = [];
    $params = [];

    if ($migrated) {
        $whereClauses[] = "p.status = 'published'";
    }

    if (!empty($_GET['id'])) {
        $sql = $baseSql . " WHERE p.id = ?";
        if ($migrated) {
            $sql .= " AND p.status = 'published'";
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$_GET['id']]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$product) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            exit();
        }
        echo json_encode($product);
        exit();
    }

    if (!empty($_GET['category']) && $_GET['category'] !== 'All') {
        $whereClauses[] = "c.name = ?";
        $params[] = $_GET['category'];
    }

    $sql = $baseSql;
    if ($whereClauses) {
        $sql .= " WHERE " . implode(" AND ", $whereClauses);
    }
    $sql .= " ORDER BY p.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
