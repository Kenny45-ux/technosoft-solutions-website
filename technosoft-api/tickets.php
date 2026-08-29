<?php
// tickets.php — GET /api/tickets.php  → list tickets
//              POST /api/tickets.php → create a ticket
//
// Uses prepared statements throughout — never concatenate user input into SQL.

require "cors.php";
require "db.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "
        SELECT t.id, t.ticket_number, t.subject, t.description, t.created_at, t.updated_at,
               c.name AS category, p.name AS priority, s.name AS status
        FROM support_tickets t
        JOIN support_ticket_categories c ON c.id = t.category_id
        JOIN support_ticket_priorities p ON p.id = t.priority_id
        JOIN support_ticket_statuses s ON s.id = t.status_id
    ";
    $params = [];
    if (!empty($_GET['customer_id'])) {
        $sql .= " WHERE t.customer_id = ?";
        $params[] = $_GET['customer_id'];
    }
    $sql .= " ORDER BY t.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // Basic validation — expand this with real checks before going live.
    if (empty($data['subject']) || empty($data['description']) || empty($data['customer_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit();
    }

    try {
        // Case-insensitive lookups so "IT Support" / "it support" / "It Support" all match.
        $catStmt = $pdo->prepare("SELECT id FROM support_ticket_categories WHERE LOWER(name) = LOWER(?)");
        $catStmt->execute([$data['category']]);
        $categoryId = $catStmt->fetchColumn();

        $prioStmt = $pdo->prepare("SELECT id FROM support_ticket_priorities WHERE LOWER(name) = LOWER(?)");
        $prioStmt->execute([$data['priority']]);
        $priorityId = $prioStmt->fetchColumn();

        $statusStmt = $pdo->query("SELECT id, name FROM support_ticket_statuses WHERE LOWER(name) = 'open' LIMIT 1");
        $openStatus = $statusStmt->fetch(PDO::FETCH_ASSOC);

        // Fail with a clear, specific JSON error instead of letting a bad foreign key
        // throw an uncaught PDOException (which prints raw HTML, not JSON).
        if ($categoryId === false) {
            http_response_code(400);
            echo json_encode(["error" => "Unknown ticket category: \"{$data['category']}\". Check it matches a row in support_ticket_categories."]);
            exit();
        }
        if ($priorityId === false) {
            http_response_code(400);
            echo json_encode(["error" => "Unknown ticket priority: \"{$data['priority']}\". Check it matches a row in support_ticket_priorities."]);
            exit();
        }
        if (!$openStatus) {
            http_response_code(500);
            echo json_encode(["error" => "No status named 'Open' (case-insensitive) found in support_ticket_statuses."]);
            exit();
        }

        $ticketNumber = "TS-" . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5)) . "-" . substr((string) time(), -3);

        $insert = $pdo->prepare("
            INSERT INTO support_tickets (ticket_number, customer_id, category_id, priority_id, status_id, subject, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $insert->execute([
            $ticketNumber, $data['customer_id'], $categoryId, $priorityId, $openStatus['id'],
            $data['subject'], $data['description'],
        ]);

        echo json_encode([
            "id" => $pdo->lastInsertId(),
            "ticket_number" => $ticketNumber,
            "status" => $openStatus['name'],
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        exit();
    }
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
