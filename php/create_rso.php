<?php
header("Content-Type: application/json");

// Function to return error messages in JSON format
function returnWithError($err) {
    echo json_encode(["error" => $err]);
    exit();
}

// Decode the incoming JSON payload
$inData = json_decode(file_get_contents('php://input'), true);

// Check if all required fields are present
if (!isset($inData["name"], $inData["description"], $inData["emails"], $inData["adminid"], $inData["uniID"])) {
    returnWithError("Missing required parameters.");
}

// Assign variables from the decoded JSON data
$name = $inData["name"];
$desc = $inData["description"];
$emails = $inData["emails"];
$adminid = $inData["adminid"];
$uniID = $inData["uniID"];

// Validate that emails is an array
if (!is_array($emails) || count($emails) < 4) {
    returnWithError("At least 4 member emails are required.");
}

// Establish database connection
$conn = new mysqli("localhost", "Server", "UltimateServerPass123", "Main");

// Check for connection errors
if ($conn->connect_error) {
    returnWithError("Connection failed: " . $conn->connect_error);
}

// Prepare and execute the statement to insert the new RSO
$stmt = $conn->prepare("INSERT INTO RSOs (name, description, adminid, uniID) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssii", $name, $desc, $adminid, $uniID);
if (!$stmt->execute()) {
    returnWithError("Failed to create RSO: " . $stmt->error);
}
$rsoID = $stmt->insert_id;
$stmt->close();

// Prepare the statement to insert members into RSO_Members
$insertStmt = $conn->prepare("INSERT IGNORE INTO RSO_Members (rsoid, uid) VALUES (?, ?)");

// Add the admin as the first member
$insertStmt->bind_param("ii", $rsoID, $adminid);
$insertStmt->execute();

// Prepare the statement to fetch user IDs based on emails
$selectStmt = $conn->prepare("SELECT uid FROM Users WHERE email = ?");

// Iterate over each email to add members
foreach ($emails as $email) {
    $selectStmt->bind_param("s", $email);
    $selectStmt->execute();
    $selectStmt->bind_result($uid);
    if ($selectStmt->fetch()) {
        $insertStmt->bind_param("ii", $rsoID, $uid);
        $insertStmt->execute();
    }
}
$selectStmt->close();
$insertStmt->close();
$conn->close();

// Return success response
echo json_encode(["success" => true, "rsoid" => $rsoID]);
?>
