<?php
header("Content-Type: application/json");

function sendResponse($success, $message, $data = []) {
    echo json_encode(array_merge(["success" => $success, "message" => $message], $data));
    exit();
}

$inputData = json_decode(file_get_contents("php://input"), true);

$requiredFields = ["uid", "name", "description", "date", "time", "location", "contactEmail", "contactPhone", "visibility", "uniID"];
foreach ($requiredFields as $field) {
    if (empty($inputData[$field])) {
        sendResponse(false, "Missing required field: $field");
    }
}

$uid = $inputData["uid"];
$name = $inputData["name"];
$description = $inputData["description"];
$date = $inputData["date"];
$time = $inputData["time"];
$location = $inputData["location"];
$contactEmail = $inputData["contactEmail"];
$contactPhone = $inputData["contactPhone"];
$visibility = $inputData["visibility"];
$uniID = $inputData["uniID"];
$rsoid = isset($inputData["rsoid"]) ? $inputData["rsoid"] : null;

$servername = "localhost";
$username = "Server";
$password = "UltimateServerPass123";
$dbname = "Main";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    sendResponse(false, "Connection failed: " . $conn->connect_error);
}

$conn->begin_transaction();

try {
    $stmt = $conn->prepare("INSERT INTO Events (eventName, description, eventType, date, time, locationID, contactPhone, contactEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssss", $name, $description, $visibility, $date, $time, $location, $contactPhone, $contactEmail);
    if (!$stmt->execute()) {
        throw new Exception("Event creation failed: " . $stmt->error);
    }
    $eventid = $stmt->insert_id;
    $stmt->close();

    switch ($visibility) {
        case "Public":
            $stmt = $conn->prepare("INSERT INTO PublicEvents (eventid, adminid, superAdminid) VALUES (?, ?, ?)");
            $superAdminid = 1;
            $stmt->bind_param("iii", $eventid, $uid, $superAdminid);
            break;
        case "Private":
            $stmt = $conn->prepare("INSERT INTO PrivateEvents (eventid, adminid, superAdminid) VALUES (?, ?, ?)");
            $superAdminid = 1;
            $stmt->bind_param("iii", $eventid, $uid, $superAdminid);
            break;
        case "RSO":
            if (is_null($rsoid)) {
                throw new Exception("RSO ID is required for RSO events.");
            }
            $stmt = $conn->prepare("INSERT INTO RSOEvents (eventid, rsoid) VALUES (?, ?)");
            $stmt->bind_param("ii", $eventid, $rsoid);
            break;
        default:
            throw new Exception("Invalid event type.");
    }

    if (!$stmt->execute()) {
        throw new Exception("Subtype insert failed: " . $stmt->error);
    }
    $stmt->close();

    $conn->commit();

    sendResponse(true, "Event created successfully.", ["eventid" => $eventid]);

} catch (Exception $e) {
    $conn->rollback();
    sendResponse(false, $e->getMessage());
} finally {
    $conn->close();
}
?>
