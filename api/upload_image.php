<?php
require_once '../db.php';
$target_dir = '../assets/images/';
$target_file = $target_dir . basename($_FILES['image']['name']);
if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
    echo json_encode(['success' => true, 'path' => $target_file]);
} else {
    echo json_encode(['success' => false]);
}
?>
