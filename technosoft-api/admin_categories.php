<?php
// admin_categories.php — admin-only category/subcategory management
//   GET    /api/admin_categories.php                → all categories with their subcategories
//   POST   /api/admin_categories.php {name}          → add a category
//   POST   /api/admin_categories.php {name,category_id} → add a subcategory (if category_id given)
//   DELETE /api/admin_categories.php?id=5             → delete a category
//   DELETE /api/admin_categories.php?subcategory_id=5 → delete a subcategory

require "cors.php";
require "db.php";
require "require_admin.php";

function slugify($text) {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $text), '-'));
    return $slug ?: 'category';
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $categories = $pdo->query("SELECT id, name, slug FROM categories ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);
    $subStmt = $pdo->prepare("SELECT id, name, slug FROM subcategories WHERE category_id = ? ORDER BY name ASC");
    foreach ($categories as &$c) {
        $subStmt->execute([$c['id']]);
        $c['subcategories'] = $subStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    echo json_encode($categories);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data['name'])) {
        http_response_code(400);
        echo json_encode(["error" => "name is required"]);
        exit();
    }
    $slug = slugify($data['name']);

    try {
        if (!empty($data['category_id'])) {
            $stmt = $pdo->prepare("INSERT INTO subcategories (category_id, name, slug) VALUES (?, ?, ?)");
            $stmt->execute([$data['category_id'], $data['name'], $slug]);
            logAdminActivity($pdo, $adminId, 'Added subcategory', $data['name']);
        } else {
            $stmt = $pdo->prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
            $stmt->execute([$data['name'], $slug]);
            logAdminActivity($pdo, $adminId, 'Added category', $data['name']);
        }
        echo json_encode(["id" => $pdo->lastInsertId(), "success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'DELETE') {
    try {
        if (!empty($_GET['subcategory_id'])) {
            $pdo->prepare("DELETE FROM subcategories WHERE id = ?")->execute([$_GET['subcategory_id']]);
        } elseif (!empty($_GET['id'])) {
            $pdo->prepare("DELETE FROM categories WHERE id = ?")->execute([$_GET['id']]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "id or subcategory_id is required"]);
            exit();
        }
        logAdminActivity($pdo, $adminId, 'Deleted category/subcategory', json_encode($_GET));
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        // Most likely a foreign key conflict — products still reference this category.
        http_response_code(409);
        echo json_encode(["error" => "Can't delete — products still use this category. Move or delete them first."]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
