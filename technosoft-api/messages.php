<?php
// messages.php — GET  /api/messages.php?ticket_id=5 → the reply thread for a ticket
//                POST /api/messages.php             → add a reply to a ticket

require "cors.php";
require "db.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (empty($_GET['ticket_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "ticket_id is required"]);
        exit();
    }
    $stmt = $pdo->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC");
    $stmt->execute([$_GET['ticket_id']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['ticket_id']) || empty($data['message'])) {
        http_response_code(400);
        echo json_encode(["error" => "ticket_id and message are required"]);
        exit();
    }

    $insert = $pdo->prepare("
        INSERT INTO ticket_messages (ticket_id, sender_type, sender_name, message)
        VALUES (?, ?, ?, ?)
    ");
    $insert->execute([
        $data['ticket_id'],
        $data['sender_type'] ?? 'customer',
        $data['sender_name'] ?? null,
        $data['message'],
    ]);

    echo json_encode([
        "id" => $pdo->lastInsertId(),
        "created_at" => date('c'),
    ]);
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
