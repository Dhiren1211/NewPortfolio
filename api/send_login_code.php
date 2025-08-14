<?php
require_once '../db.php';
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load PHPMailer classes (make sure you have installed via Composer or downloaded src files)
require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';

// Get JSON input
$rawPost = file_get_contents('php://input');
$data = json_decode($rawPost, true);

$email = $data['email'] ?? '';
error_log('Received email: ' . $email);

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email']);
    exit;
}

// Check if email exists in profile table
$checkStmt = $conn->prepare('SELECT id FROM profile WHERE contact_email = ?');
$checkStmt->bind_param('s', $email);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows === 0) {
    echo json_encode(['success' => false, 'error' => 'This email is not registered as admin.']);
    $checkStmt->close();
    exit;
}
$checkStmt->close();

// Generate code & expiry
$code = rand(100000, 999999);
$expiry = date('Y-m-d H:i:s', strtotime('+10 minutes'));

// Store code in DB
$stmt = $conn->prepare('REPLACE INTO login_codes (email, code, expires_at) VALUES (?, ?, ?)');
$stmt->bind_param('sis', $email, $code, $expiry);
$stmt->execute();
$stmt->close();

// Send email using PHPMailer
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com'; // Replace with your SMTP host
    $mail->SMTPAuth = true;
    $mail->Username = 'kaidiofficial22625@gmail.com'; // Replace with your email
    $mail->Password = 'onjq gckn upfo yelk';   // Use App Password if Gmail 2FA enabled
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('kaidiofficial22625@gmail.com', 'Dhiren Portfolio');
    $mail->addAddress($email);

    $mail->Subject = 'Your Admin Login Code';
    $mail->Body    = "Your login code is: $code\nThis code expires in 10 minutes.";

    $mail->send();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $mail->ErrorInfo]);
}

?>
