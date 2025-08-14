<?php
header('Content-Type: application/json');
require_once '../db.php';

// Validate input
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

// Required fields
$required = ['title', 'description', 'type'];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        echo json_encode(['success' => false, 'error' => "$field is required"]);
        exit;
    }
}

// Validate project type
$allowedTypes = ['AI/ML', 'Cyber', 'Other'];
if (!in_array($_POST['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Invalid project type']);
    exit;
}

// Handle file upload
$imagePath = null;
if (isset($_FILES['image']) {
    $uploadDir = '../assets/uploads/';
    $filename = uniqid() . '_' . basename($_FILES['image']['name']);
    $targetPath = $uploadDir . $filename;
    
    // Validate image
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($_FILES['image']['type'], $allowedTypes)) {
        echo json_encode(['success' => false, 'error' => 'Only JPG, PNG, and GIF images are allowed']);
        exit;
    }

    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        $imagePath = $filename;
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to upload image']);
        exit;
    }
}

// Insert into database
try {
    $stmt = $conn->prepare("INSERT INTO projects (title, description, type, url, image) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", 
        $_POST['title'],
        $_POST['description'],
        $_POST['type'],
        $_POST['url'] ?? null,
        $imagePath
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Database insert failed']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>