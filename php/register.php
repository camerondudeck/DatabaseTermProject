<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

$conn = new mysqli("localhost", "Server", "UltimateServerPass123", "Main");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit;
}

$name = isset($data["name"]) ? $conn->real_escape_string($data["name"]) : null;
$email = isset($data["email"]) ? $conn->real_escape_string($data["email"]) : null;
$password = isset($data["password"]) ? password_hash($data["password"], PASSWORD_DEFAULT) : null;
$uniID = isset($data["uniID"]) ? intval($data["uniID"]) : null;

if (!$name || !$email || !$password || !$uniID) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$check = $conn->query("SELECT UID FROM Users WHERE Email = '$email'");
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already registered"]);
    exit;
}

$checkUni = $conn->query("SELECT * FROM Universities WHERE UniID = $uniID");
if ($checkUni->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invalid university ID"]);
    exit;
}

$sql = "INSERT INTO Users (Name, Email, PasswordHash, UniID, Role)
        VALUES ('$name', '$email', '$password', $uniID, 'Student')";

if ($conn->query($sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}

$conn->close();
?>
