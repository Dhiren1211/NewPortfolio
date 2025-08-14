<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php'; // Adjust path to your DB connection

// Check if admin is logged in
if (!isset($_SESSION['admin_email'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

// Fetch all contacts
$sql = "SELECT id, name, email, message, created_at FROM contact ORDER BY created_at DESC";
$result = $conn->query($sql);

$contacts = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $contacts[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'message' => $row['message'],
            'created_at' => $row['created_at']
        ];
    }
}

echo json_encode(['success' => true, 'contacts' => $contacts]);
?>
