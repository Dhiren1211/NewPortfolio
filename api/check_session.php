<?php
session_start();
header('Content-Type: application/json');

// Session timeout in seconds (60 minutes)
$timeout = 60 * 60;

// Check if admin email is set
if(isset($_SESSION['admin_email'])){
    // Check for inactivity timeout
    if(isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeout){
        session_unset();
        session_destroy();
        echo json_encode(['loggedIn' => false]);
        exit;
    }
    // Update last activity timestamp
    $_SESSION['last_activity'] = time();
    echo json_encode(['loggedIn' => true, 'email' => $_SESSION['admin_email']]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>
