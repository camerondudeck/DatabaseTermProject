<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

$conn = new mysqli("localhost", "Server", "UltimateServerPass123", "Main");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$email = isset($data["email"]) ? $conn->real_escape_string($data["email"]) : null;
$password = $data["password"] ?? null;

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Missing email or password"]);
    exit;
}

$result = $conn->query("SELECT UID, Name, PasswordHash, uniID, Role FROM Users WHERE Email = '$email'");
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$user = $result->fetch_assoc();
if (password_verify($password, $user["PasswordHash"])) {
    echo json_encode([
        "success" => true,
        "name" => $user["Name"],
        "uid" => $user["UID"],
        "uniID" => $user["uniID"],
        "role" => $user["Role"]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
}
$conn->close();
?>
