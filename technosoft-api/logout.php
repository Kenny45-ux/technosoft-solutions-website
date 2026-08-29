<?php
// logout.php — POST /api/logout.php → destroy the server-side session

require "cors.php";

session_start();
$_SESSION = [];
session_destroy();

echo json_encode(["success" => true]);
