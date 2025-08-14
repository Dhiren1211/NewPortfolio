<?php
require_once '../db.php';
$sql = "SELECT name, avatar, contact_email, phone FROM profile LIMIT 1";
$result = $conn->query($sql);
if ($result && $row = $result->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode([]);
}
?>
