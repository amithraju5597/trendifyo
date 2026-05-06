<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.html');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - Trendifyo</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h2>Welcome to your Dashboard, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h2>
    <p>This is a protected area. Only logged-in users can see this.</p>
    <a href="logout.php">Logout</a>
</body>
</html>