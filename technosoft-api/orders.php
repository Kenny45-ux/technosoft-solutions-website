<?php
// orders.php — GET  /api/orders.php?customer_id=1       → a customer's orders
//              GET  /api/orders.php?order_number=TS-..  → one order + its items
//              POST /api/orders.php                      → create an order (checkout)
//
// Schema notes: orders.customer_id is NOT NULL (checkout requires a logged-in
// account — matches how support_tickets works). orders itself has no
// name/email/phone columns; contact info lives on the customer's account via
// customer_id, and delivery_address is the only per-order address field.
// payment_method is a strict ENUM('mobile_money','card','bank_transfer').

require "cors.php";
require "db.php";
require "mailer.php";

// Frontend sends "Mobile Money" / "Card" / "Bank Transfer" — map to the DB's enum values.
function mapPaymentMethod($label) {
    $map = [
        'Mobile Money' => 'mobile_money',
        'Card' => 'card',
        'Bank Transfer' => 'bank_transfer',
    ];
    return $map[$label] ?? null;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!empty($_GET['order_number'])) {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE order_number = ?");
        $stmt->execute([$_GET['order_number']]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$order) {
            http_response_code(404);
            echo json_encode(["error" => "Order not found"]);
            exit();
        }
        $items = $pdo->prepare("
            SELECT oi.*, p.name AS product_name
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?
        ");
        $items->execute([$order['id']]);
        $order['items'] = $items->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($order);
        exit();
    }

    $sql = "SELECT * FROM orders";
    $params = [];
    if (!empty($_GET['customer_id'])) {
        $sql .= " WHERE customer_id = ?";
        $params[] = $_GET['customer_id'];
    }
    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['customer_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "You must be logged in to place an order."]);
        exit();
    }
    if (empty($data['address']) || empty($data['items'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required order fields"]);
        exit();
    }

    $paymentMethod = mapPaymentMethod($data['payment'] ?? '');
    if (!$paymentMethod) {
        http_response_code(400);
        echo json_encode(["error" => "Unrecognized payment method: \"{$data['payment']}\". Expected Mobile Money, Card, or Bank Transfer."]);
        exit();
    }

    $subtotal = 0;
    foreach ($data['items'] as $item) {
        $subtotal += ((float) $item['price']) * ((int) $item['qty']);
    }
    $deliveryFee = $subtotal > 0 ? 100 : 0;
    $total = $subtotal + $deliveryFee;
    $orderNumber = "TS-" . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5)) . "-" . substr((string) time(), -4);

    try {
        $pdo->beginTransaction();

        $insertOrder = $pdo->prepare("
            INSERT INTO orders (order_number, customer_id, order_status, subtotal, delivery_fee, total, payment_status, payment_method, delivery_address)
            VALUES (?, ?, 'pending', ?, ?, ?, 'unpaid', ?, ?)
        ");
        $insertOrder->execute([
            $orderNumber, $data['customer_id'], $subtotal, $deliveryFee, $total, $paymentMethod, $data['address'],
        ]);
        $orderId = $pdo->lastInsertId();

        $insertItem = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?)
        ");
        foreach ($data['items'] as $item) {
            $lineSubtotal = ((float) $item['price']) * ((int) $item['qty']);
            $insertItem->execute([$orderId, $item['id'], $item['qty'], $item['price'], $lineSubtotal]);
        }

        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        exit();
    }

    // Email confirmation is best-effort — never blocks the order itself.
    $emailSent = false;
    if (!empty($data['email']) && !empty($data['name'])) {
        $emailSent = sendOrderConfirmationEmail($data['email'], $data['name'], $orderNumber, $total);
    }

    echo json_encode([
        "id" => $orderId,
        "order_number" => $orderNumber,
        "tracking_number" => $orderNumber,
        "total" => $total,
        "status" => "pending",
        "email_sent" => $emailSent,
    ]);
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
