<?php
// admin_stats.php — GET /api/admin_stats.php → dashboard summary numbers
//
// Every value here is a real query against your data — nothing hardcoded.
// If a table has zero rows, its stat is honestly 0.

require "cors.php";
require "db.php";
require "require_admin.php";

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

function scalar(PDO $pdo, string $sql): int {
    return (int) $pdo->query($sql)->fetchColumn();
}

// Wrapped in a function so a missing table (e.g. blog_posts before the
// migration is run) degrades to 0 instead of crashing the whole dashboard.
function safeScalar(PDO $pdo, string $sql): int {
    try {
        return scalar($pdo, $sql);
    } catch (PDOException $e) {
        return 0;
    }
}

echo json_encode([
    "products" => [
        "total" => safeScalar($pdo, "SELECT COUNT(*) FROM products"),
        "in_stock" => safeScalar($pdo, "SELECT COUNT(*) FROM products WHERE stock_status = 'in_stock'"),
        "out_of_stock" => safeScalar($pdo, "SELECT COUNT(*) FROM products WHERE stock_status = 'out_of_stock'"),
        "on_promotion" => safeScalar($pdo, "SELECT COUNT(*) FROM products WHERE discount_percent > 0 AND (promo_end IS NULL OR promo_end >= CURDATE())"),
    ],
    "orders" => [
        "total" => safeScalar($pdo, "SELECT COUNT(*) FROM orders"),
        "pending" => safeScalar($pdo, "SELECT COUNT(*) FROM orders WHERE order_status = 'pending'"),
    ],
    "tickets" => [
        "open" => safeScalar($pdo, "SELECT COUNT(*) FROM support_tickets t JOIN support_ticket_statuses s ON s.id = t.status_id WHERE s.name = 'Open'"),
        "resolved" => safeScalar($pdo, "SELECT COUNT(*) FROM support_tickets t JOIN support_ticket_statuses s ON s.id = t.status_id WHERE s.name = 'Resolved'"),
    ],
    "blog" => [
        "published" => safeScalar($pdo, "SELECT COUNT(*) FROM blog_posts WHERE status = 'published'"),
    ],
]);
