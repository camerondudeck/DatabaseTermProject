<?php
header("Content-Type: application/json");

function returnWithError($error) {
    echo json_encode(["error" => $error]);
    exit();
}

$inData = json_decode(file_get_contents('php://input'), true);

if (!isset($inData["adminid"])) {
    returnWithError("Missing required parameter: adminid.");
}

$adminid = $inData["adminid"];

$conn = new mysqli("localhost", "Server", "UltimateServerPass123", "Main");

if ($conn->connect_error) {
    returnWithError("Connection failed: " . $conn->connect_error);
}

$stmt = $conn->prepare("SELECT rsoid, name, description FROM RSOs WHERE adminid = ?");
$stmt->bind_param("i", $adminid);

if (!$stmt->execute()) {
    returnWithError("Failed to retrieve RSOs: " . $stmt->error);
}

$result = $stmt->get_result();

$rsos = [];
while ($row = $result->fetch_assoc()) {
    $rsos[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode($rsos);
?>
