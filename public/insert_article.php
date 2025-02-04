<?php
header('Content-Type: application/json');

// Database connection settings
$servername = "localhost";
$username = "your_db_username";
$password = "your_db_password";
$dbname = "your_db_name";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$title = $data['title'] ?? null;
$summary = $data['summary'] ?? null;
$content = $data['content'] ?? null;
$image = $data['image'] ?? null;

if ($title && $summary && $content && $image) {
    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO articles (title, summary, content, image) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $title, $summary, $content, $image);

    // Execute the statement
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Article inserted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error inserting article: ' . $stmt->error]);
    }

    // Close the statement
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
}

// Close the connection
$conn->close();
?>
