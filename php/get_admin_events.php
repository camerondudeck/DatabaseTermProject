<?php
header("Content-Type: application/json");

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['adminid']) || !is_numeric($input['adminid'])) {
    echo json_encode(["error" => "Invalid or missing admin ID."]);
    exit();
}

$adminid = intval($input['adminid']);

$conn = new mysqli("localhost", "Server", "UltimateServerPass123", "Main");

if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

$sql = "SELECT event_id, event_name, event_date, event_location FROM events WHERE admin_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $adminid);
$stmt->execute();
$result = $stmt->get_result();

$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode($events);
?>
