<?php
// register.php — POST /api/register.php → create an account in the `users` table
//
// Passwords are hashed with password_hash() (bcrypt) — never stored in plain text.
// New signups get role = 'customer' (there's also 'agent'/'admin' for staff,
// but nothing in this app creates those roles).

require "cors.php";
require "db.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Name, email and password are required"]);
    exit();
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Enter a valid email address"]);
    exit();
}

if (strlen($data['password']) < 6) {
    http_response_code(400);
    echo json_encode(["error" => "Password must be at least 6 characters"]);
    exit();
}

// Reject duplicate accounts
$check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$check->execute([$data['email']]);
if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(["error" => "An account with this email already exists"]);
    exit();
}

$hash = password_hash($data['password'], PASSWORD_DEFAULT);

$insert = $pdo->prepare("
    INSERT INTO users (name, email, password_hash, phone, company, role)
    VALUES (?, ?, ?, ?, ?, 'customer')
");
$insert->execute([
    $data['name'],
    $data['email'],
    $hash,
    $data['phone'] ?? null,
    $data['company'] ?? null,
]);

$newUserId = $pdo->lastInsertId();

session_start();
session_regenerate_id(true);
$_SESSION['user_id'] = $newUserId;
$_SESSION['role'] = 'customer';

echo json_encode([
    "id" => $newUserId,
    "name" => $data['name'],
    "email" => $data['email'],
    "role" => "customer",
]);
