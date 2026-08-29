<?php
// admin_product_images.php — admin-only product image management
//   GET    ?product_id=5              → list a product's images
//   POST   (multipart form, product_id + image[] files) → upload one or more images
//   PATCH  ?id=7 { is_primary: true }  → set an image as the primary/cover image
//   PATCH  ?id=7 { sort_order: 2 }     → reorder
//   DELETE ?id=7                       → remove one image (and its file)

require "cors.php";
require "db.php";
require "require_admin.php";

$method = $_SERVER['REQUEST_METHOD'];
$uploadDir = __DIR__ . '/uploads/products/';
$publicPath = '/technosoft-api/uploads/products/'; // adjust if you serve uploads differently

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if ($method === 'GET') {
    if (empty($_GET['product_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "product_id is required"]);
        exit();
    }
    $stmt = $pdo->prepare("SELECT id, image_url, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC");
    $stmt->execute([$_GET['product_id']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'POST') {
    if (empty($_POST['product_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "product_id is required"]);
        exit();
    }
    if (empty($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(["error" => "No image file(s) provided"]);
        exit();
    }

    $productId = $_POST['product_id'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $maxBytes = 5 * 1024 * 1024; // 5MB per image
    $uploaded = [];

    // Support both a single file and a multi-file array (name="image[]")
    $files = is_array($_FILES['image']['name']) ? $_FILES['image'] : ['name' => [$_FILES['image']['name']], 'type' => [$_FILES['image']['type']], 'tmp_name' => [$_FILES['image']['tmp_name']], 'error' => [$_FILES['image']['error']], 'size' => [$_FILES['image']['size']]];

    // Does this product already have any images / a primary image?
    $countStmt = $pdo->prepare("SELECT COUNT(*) AS total, SUM(is_primary) AS has_primary, COALESCE(MAX(sort_order), -1) AS max_order FROM product_images WHERE product_id = ?");
    $countStmt->execute([$productId]);
    $existing = $countStmt->fetch(PDO::FETCH_ASSOC);
    $nextOrder = (int) $existing['max_order'] + 1;
    $hasPrimary = (int) $existing['has_primary'] > 0;

    for ($i = 0; $i < count($files['name']); $i++) {
        if ($files['error'][$i] !== UPLOAD_ERR_OK) continue;
        if (!in_array($files['type'][$i], $allowedTypes, true)) continue;
        if ($files['size'][$i] > $maxBytes) continue;

        $ext = pathinfo($files['name'][$i], PATHINFO_EXTENSION);
        $filename = 'p' . $productId . '_' . bin2hex(random_bytes(6)) . '.' . strtolower($ext);
        $destPath = $uploadDir . $filename;

        if (move_uploaded_file($files['tmp_name'][$i], $destPath)) {
            $imageUrl = $publicPath . $filename;
            $isPrimary = (!$hasPrimary && count($uploaded) === 0) ? 1 : 0; // first upload becomes primary if none exists yet
            $insert = $pdo->prepare("INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)");
            $insert->execute([$productId, $imageUrl, $isPrimary, $nextOrder]);
            $uploaded[] = ["id" => $pdo->lastInsertId(), "image_url" => $imageUrl, "is_primary" => $isPrimary];
            $nextOrder++;
            if ($isPrimary) $hasPrimary = true;
        }
    }

    if (empty($uploaded)) {
        http_response_code(400);
        echo json_encode(["error" => "No valid images were uploaded (check file type is JPEG/PNG/WEBP/GIF and under 5MB)"]);
        exit();
    }

    logAdminActivity($pdo, $adminId, 'Uploaded product images', "product #$productId, " . count($uploaded) . " image(s)");
    echo json_encode(["uploaded" => $uploaded]);
    exit();
}

if ($method === 'PATCH') {
    if (empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Image id is required"]);
        exit();
    }
    $data = json_decode(file_get_contents("php://input"), true);

    if (array_key_exists('is_primary', $data) && $data['is_primary']) {
        // Find which product this image belongs to, then clear any other primary on that product.
        $lookup = $pdo->prepare("SELECT product_id FROM product_images WHERE id = ?");
        $lookup->execute([$_GET['id']]);
        $row = $lookup->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $pdo->prepare("UPDATE product_images SET is_primary = 0 WHERE product_id = ?")->execute([$row['product_id']]);
            $pdo->prepare("UPDATE product_images SET is_primary = 1 WHERE id = ?")->execute([$_GET['id']]);
        }
    }
    if (array_key_exists('sort_order', $data)) {
        $pdo->prepare("UPDATE product_images SET sort_order = ? WHERE id = ?")->execute([$data['sort_order'], $_GET['id']]);
    }

    echo json_encode(["success" => true]);
    exit();
}

if ($method === 'DELETE') {
    if (empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Image id is required"]);
        exit();
    }
    $lookup = $pdo->prepare("SELECT image_url FROM product_images WHERE id = ?");
    $lookup->execute([$_GET['id']]);
    $row = $lookup->fetch(PDO::FETCH_ASSOC);

    $pdo->prepare("DELETE FROM product_images WHERE id = ?")->execute([$_GET['id']]);

    if ($row) {
        $filePath = __DIR__ . '/uploads/products/' . basename($row['image_url']);
        if (file_exists($filePath)) unlink($filePath);
    }

    logAdminActivity($pdo, $adminId, 'Deleted product image', "image #{$_GET['id']}");
    echo json_encode(["success" => true]);
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
