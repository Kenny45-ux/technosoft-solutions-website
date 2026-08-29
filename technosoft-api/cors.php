<?php
// cors.php — include this at the top of every endpoint file.
// During development, React runs on http://localhost:5173 and PHP on
// http://localhost — different origins, so the browser blocks the request
// unless the API explicitly allows it via these headers.
//
// Allow-Credentials + an exact (non-wildcard) Allow-Origin lets the admin
// panel's session cookie travel with each request — required for
// session-based admin authentication to work across the two ports.

header("Access-Control-Allow-Origin: http://localhost:5173"); // change to your real domain in production
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Browsers send an OPTIONS preflight request before the real one — just acknowledge it.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
