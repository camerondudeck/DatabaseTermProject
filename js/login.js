function loginUser() {
    const email = document.getElementById('Lemail').value.trim();
    const password = document.getElementById('Lpassword').value;

    fetch('php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = "dashboard.html";
        } else {
            alert("Login failed: " + data.message);
        }
    })
    .catch(err => {
        console.error("Login error:", err);
        alert("Something went wrong during login.");
    });
}