<?php
require_once '../db.php';
$sql = "SELECT id, title, provider, image, url, ProvidedDate FROM certificates ORDER BY id DESC";
$result = $conn->query($sql);
$certs = [];
while ($row = $result->fetch_assoc()) {
    $certs[] = $row;
}
echo json_encode([
        'success' => true,
        'certificates' => $certs  
]);
?>
