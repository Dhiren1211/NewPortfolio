<?php
require_once '../db.php';
$sql = "SELECT title, description, image, url, type FROM projects ORDER BY id DESC";
$result = $conn->query($sql);
$projects = [];
while ($row = $result->fetch_assoc()) {
    $projects[] = $row;
}
echo json_encode([
    'success' => true,
    'projects' => $projects
]);
?>
