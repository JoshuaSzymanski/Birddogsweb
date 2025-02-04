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

$sql = "SELECT id, title, summary, content, image FROM articles";
$result = $conn->query($sql);

$articles = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $articles[] = $row;
    }
} else {
    echo "0 results";
}
$conn->close();

header('Content-Type: application/json');
echo json_encode(array('articles' => $articles));
?>
