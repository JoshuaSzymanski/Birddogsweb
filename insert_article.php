<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

    // Get the form data
    $title = $_POST['title'];
    $summary = $_POST['summary'];
    $content = $_POST['content'];
    $image = '';

    // Check if an image was uploaded
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $target_dir = "/c:/xampp/htdocs/uploads/";
        $target_file = $target_dir . basename($_FILES["image"]["name"]);
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            $image = $target_file;
        } else {
            echo json_encode(['success' => false, 'message' => 'Sorry, there was an error uploading your file.']);
            exit;
        }
    } else if (isset($_FILES['image']) && $_FILES['image']['error'] != 0) {
        switch ($_FILES['image']['error']) {
            case UPLOAD_ERR_INI_SIZE:
                echo "The uploaded file exceeds the upload_max_filesize directive in php.ini.";
                break;
            case UPLOAD_ERR_FORM_SIZE:
                echo "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.";
                break;
            case UPLOAD_ERR_PARTIAL:
                echo "The uploaded file was only partially uploaded.";
                break;
            case UPLOAD_ERR_NO_FILE:
                echo "No file was uploaded.";
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                echo "Missing a temporary folder.";
                break;
            case UPLOAD_ERR_CANT_WRITE:
                echo "Failed to write file to disk.";
                break;
            case UPLOAD_ERR_EXTENSION:
                echo "A PHP extension stopped the file upload.";
                break;
            default:
                echo "Unknown upload error.";
                break;
        }
        exit;
    }

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO articles (title, summary, content, image) VALUES (?, ?, ?, ?)");
    if ($stmt === false) {
        die(json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]));
    }
    $stmt->bind_param("ssss", $title, $summary, $content, $image);

    // Execute the statement
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'New article created successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error executing statement: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
