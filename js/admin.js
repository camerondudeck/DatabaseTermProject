let uidFromCookie, uniIDFromCookie;

function readCookie() {
    const cookies = document.cookie.split(';');
    const userData = {};

    for (let cookie of cookies) {
        let [name, value] = cookie.trim().split('=');
        userData[name] = decodeURIComponent(value);
    }

    uidFromCookie = parseInt(userData.uid);
    uniIDFromCookie = parseInt(userData.uniID);
}

window.onload = function () {
    readCookie();

    if (!uidFromCookie || !uniIDFromCookie) {
        alert("Not logged in.");
        window.location.href = "index.html";
        return;
    }

    loadRSOs();
    loadAdminEvents();

    document.getElementById("createEventForm").addEventListener("submit", function (e) {
        e.preventDefault();
        createEvent();
    });

    const rsoForm = document.getElementById("createRSOForm");
    if (rsoForm) {
        rsoForm.addEventListener("submit", function (e) {
            e.preventDefault();
            createRSO();
        });
    }
};

function goToEvents() {
    window.location.href = "home.html";
}

function logout() {
    document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = "index.html";
}

function showEventForm() {
    document.getElementById("eventSection").style.display = "block";
    document.getElementById("rsoSection").style.display = "none";
}

function showRSOForm() {
    document.getElementById("eventSection").style.display = "none";
    document.getElementById("rsoSection").style.display = "block";
}

function loadRSOs() {
    fetch("http://eventsatuni.info/php/get_admin_rsos.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminid: uidFromCookie }) 
    .then(res => res.json())
    .then(rsos => {
        if (!Array.isArray(rsos)) {
            console.error("Expected an array but received:", rsos);
            return;
        }
        const select = document.getElementById("rsoSelect");
        select.innerHTML = '<option value="">Select RSO</option>';
        rsos.forEach(rso => {
            let opt = document.createElement("option");
            opt.value = rso.rsoid; 
            opt.textContent = rso.name;
            select.appendChild(opt);
        });
    })
    .catch(error => console.error("Error fetching RSOs:", error));
}


function createEvent() {

    const eventDetails = {
        uid: uidFromCookie, 
        name: document.getElementById("eventName").value.trim(),
        description: document.getElementById("eventDescription").value.trim(),
        date: document.getElementById("eventDate").value,
        time: document.getElementById("eventTime").value,
        location: document.getElementById("eventLocation").value.trim(),
        contactEmail: document.getElementById("contactEmail").value.trim(),
        contactPhone: document.getElementById("contactPhone").value.trim(),
        visibility: document.getElementById("eventVisibility").value,
        rsoid: document.getElementById("rsoSelect").value || null,
        uniID: uniIDFromCookie 
    };

    if (!eventDetails.name || !eventDetails.date || !eventDetails.time || !eventDetails.location) {
        alert("Please fill in all required fields.");
        return;
    }

    fetch("http://eventsatuni.info/php/create_event.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(eventDetails)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            alert("Event created successfully!");
            document.getElementById("createEventForm").reset();
            
            loadAdminEvents();
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while creating the event.");
    });
}


function loadAdminEvents() {
    fetch("http://eventsatuni.info/php/get_admin_events.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminid: uidFromCookie })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Received non-JSON response");
        }
        return res.json();
    })
    .then(events => {
        const list = document.getElementById("adminEventsList");
        list.innerHTML = "";

        if (!Array.isArray(events)) {
            console.error("Expected an array but received:", events);
            list.textContent = "Error loading events.";
            return;
        }

        if (events.length === 0) {
            list.textContent = "No events created yet.";
            return;
        }

        events.forEach(evt => {
            const div = document.createElement("div");
            div.className = "event-card";
            div.innerHTML = `
                <h3>${evt.name}</h3>
                <p>${evt.date} @ ${evt.time}</p>
                <p>${evt.location}</p>
            `;
            list.appendChild(div);
        });
    })
    .catch(error => {
        console.error("Error fetching events:", error);
        const list = document.getElementById("adminEventsList");
        list.textContent = "Failed to load events.";
    });
}


function createRSO() {
    const name = document.getElementById("rsoName").value.trim();
    const desc = document.getElementById("rsoDescription").value.trim();
    const emails = document.getElementById("memberEmails").value.trim().split(',').map(e => e.trim());

    if (emails.length < 4) {
        document.getElementById("rsoMessage").textContent = "You must provide at least 4 member emails.";
        return;
    }

    fetch("http://eventsatuni.info/php/create_rso.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            description: desc,
            emails: emails,
            adminid: uidFromCookie,
            uniID: uniIDFromCookie
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById("rsoMessage").textContent = data.error;
            } else {
                document.getElementById("rsoMessage").textContent = "RSO created successfully!";
                document.getElementById("createRSOForm").reset();
                loadRSOs();
            }
        });
}
