<?php
// login.php — POST /api/login.php → verify credentials, return the user record
//
// Starts a real PHP session and stores user_id + role in it — this is what
// admin-only endpoints (require_admin.php) check server-side. The frontend
// still gets the user record back in the JSON body for display purposes,
// but the SESSION is the actual source of truth for who's logged in and
// what they're allowed to do — a customer editing localStorage by hand
// cannot grant themselves admin access.

require "cors.php";
require "db.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required"]);
    exit();
}

$stmt = $pdo->prepare("SELECT id, name, email, password_hash, role FROM users WHERE email = ?");
$stmt->execute([$data['email']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($data['password'], $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit();
}

session_start();
session_regenerate_id(true); // prevent session fixation
$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];

echo json_encode([
    "id" => $user['id'],
    "name" => $user['name'],
    "email" => $user['email'],
    "role" => $user['role'],
]);
