<?php
// me.php — GET /api/me.php → the currently logged-in user (from the session), or 401
//
// The admin panel calls this on load to verify there's a real, valid admin
// session before showing anything — never trusts a role value the frontend
// might already have cached in localStorage.

require "cors.php";
require "db.php";

session_start();

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not logged in"]);
    exit();
}

$stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Session user no longer exists"]);
    exit();
}

echo json_encode($user);
