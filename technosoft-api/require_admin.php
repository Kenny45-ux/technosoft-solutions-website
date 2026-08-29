<?php
// require_admin.php — include this (after cors.php and db.php) at the top
// of every admin-only endpoint.
//
// This is the actual security boundary: it checks the PHP session set by
// login.php, not any role field the client claims in the request body.
// A logged-out visitor, or a logged-in customer, gets a 401/403 here before
// any of the endpoint's real logic runs.

session_start();

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "You must be logged in."]);
    exit();
}

if (($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Admin access required."]);
    exit();
}

// Available to the including file as the current admin's id, for activity logging.
$adminId = $_SESSION['user_id'];

/**
 * Records an admin action for accountability (admin_activity_logs table).
 * Best-effort — a logging failure never blocks the actual admin action.
 */
function logAdminActivity(PDO $pdo, int $adminId, string $action, string $details = ''): void {
    try {
        $stmt = $pdo->prepare("INSERT INTO admin_activity_logs (admin_id, action, details) VALUES (?, ?, ?)");
        $stmt->execute([$adminId, $action, $details]);
    } catch (PDOException $e) {
        error_log("Failed to log admin activity: " . $e->getMessage());
    }
}
