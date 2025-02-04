<?php
$servername = "localhost";
$username = "root"; // Default XAMPP username
$password = "HkTtPSS@12!#051132#"; // Default XAMPP password is empty
$dbname = "birddogweb";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO articles (title, summary, content, image) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $title, $summary, $content, $image);

// Set parameters and execute
$title = $_POST['title'];
$summary = $_POST['summary'];
$content = $_POST['content'];
$image = $_POST['image'];
$stmt->execute();

echo "New article created successfully";

$stmt->close();
$conn->close();
?>
