<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "Server", "UltimateServerPass123", "Main");
if ($conn->connect_error) {
    echo json_encode([]);
    exit;
}

$result = $conn->query("SELECT UniID, Name FROM Universities");
$universities = [];

while ($row = $result->fetch_assoc()) {
    $universities[] = $row;
}

echo json_encode($universities);
$conn->close();
?>