const urlBase = 'http://eventsatuni.info/php'
const extension = 'php';

window.addEventListener('DOMContentLoaded', () => {
    fetch('php/get_universities.php')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('RuniID');
            select.innerHTML = '';
            data.forEach(u => {
                const option = document.createElement('option');
                option.value = u.UniID;
                option.textContent = u.Name;
                select.appendChild(option);
            });
        });
});

function registerUser() {
    const name = document.getElementById('Rname').value;
    const email = document.getElementById('Remail').value;
    const password = document.getElementById('Rpassword').value;
    const uniID = document.getElementById('RuniID').value;

    console.log("Sending data:", { name, email, password, uniID });

    fetch('http://eventsatuni.info/php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, uniID })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Registration successful!");
            location.reload();
        } else {
            alert("Registration failed: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("An error occurred during registration.");
    });
}