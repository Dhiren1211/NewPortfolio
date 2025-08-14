<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$code = $data['code'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{6}$/', $code)) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}

$stmt = $conn->prepare('SELECT expires_at FROM login_codes WHERE email=? AND code=?');
$stmt->bind_param('si', $email, $code);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1) {
    $stmt->bind_result($expires_at);
    $stmt->fetch();
    if (strtotime($expires_at) > time()) {
        // Valid code: set session
        $_SESSION['admin_email'] = $email;
        $_SESSION['last_activity'] = time();
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Code expired']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid code']);
}

$stmt->close();
?>
