<?php
// db.php — single shared database connection.
// Credentials live ONLY here, server-side. Never in React/Vite code.

$host = "localhost";
$dbname = "technosoft";
$username = "root";       // default XAMPP MySQL user
$password = "";           // default XAMPP MySQL password is blank

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(["error" => "Database connection failed"]));
}
