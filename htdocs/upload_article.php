<?php
$servername = "localhost";
$username = "root"; // Default XAMPP username
$password = "HkTtPSS@12!#051132#"; // Your MySQL password
$dbname = "birddogweb";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the form data
    $title = $_POST['title'];
    $summary = $_POST['summary'];
    $content = $_POST['content'];
    $image = '';

    // Check if an image was uploaded
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $target_dir = "uploads/";
        $target_file = $target_dir . basename($_FILES["image"]["name"]);
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            $image = $target_file;
        } else {
            echo "Sorry, there was an error uploading your file.";
            exit;
        }
    }

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO articles (title, summary, content, image) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $title, $summary, $content, $image);

    // Execute the statement
    if ($stmt->execute()) {
        echo "New article created successfully";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
}

$conn->close();
?>
