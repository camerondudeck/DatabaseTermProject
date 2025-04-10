let uid = 0;
let uniID = 0;
let email = "";
let name = "";
let role = "";

function loginUser() {
    uid = 0;
    uniID = 0;
    name = "";
    role = "";

    email = document.getElementById("Lemail").value;
    let password = document.getElementById("Lpassword").value;

    document.getElementById("loginResult").innerHTML = "";

    let tmp = { email: email, password: password };
    let jsonPayload = JSON.stringify(tmp);

    let url = 'http://eventsatuni.info/php/login.php';

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error) {
                    document.getElementById("loginResult").innerHTML = jsonObject.error;
                    return;
                }

                uid = jsonObject.uid;

                if (uid < 1) {
                    document.getElementById("loginResult").innerHTML = "Login failed. Please try again.";
                    return;
                }

                uniID = jsonObject.uniID;
                name = jsonObject.name;
                role = jsonObject.role;

                saveCookie();
                document.getElementById("loginResult").innerHTML = "Login successful!";
                window.location.href = "home.html";
            } else {
                document.getElementById("loginResult").innerHTML = "Login failed. Please check your connection.";
            }
        }
    };

    try {
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}

function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));


    document.cookie = "name=" + encodeURIComponent(name) + "; expires=" + date.toGMTString() + "; path=/";
    document.cookie = "email=" + encodeURIComponent(email) + "; expires=" + date.toGMTString() + "; path=/";
    document.cookie = "uid=" + uid + "; expires=" + date.toGMTString() + "; path=/";
    document.cookie = "uniID=" + uniID + "; expires=" + date.toGMTString() + "; path=/";
    document.cookie = "role=" + encodeURIComponent(role) + "; expires=" + date.toGMTString() + "; path=/";
}