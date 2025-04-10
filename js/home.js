let uidFromCookie, uniIDFromCookie, roleFromCookie;

function readCookie() {
    const cookies = document.cookie.split(';');
    const userData = {};
  
    for (let cookie of cookies) {
      let [name, value] = cookie.trim().split('=');
      if (name && value) {
        userData[name] = decodeURIComponent(value);
      }
    }
  
    uidFromCookie = parseInt(userData.uid || 0);
    uniIDFromCookie = parseInt(userData.uniID || 0);
    nameFromCookie = userData.name || "";
    emailFromCookie = userData.email || "";
    roleFromCookie = userData.role || "";
  }
  

function goToEvents() {
    window.location.href = "events.html";
}

function goToAdmin() {
    window.location.href = "admin.html";
}

window.onload = () => {
    readCookie();
    if (!uidFromCookie || !uniIDFromCookie) {
        alert("You must be logged in.");
        window.location.href = "index.html";
        return;
    }
    loadEvents();
};

function loadEvents() {
    fetch("http://eventsatuni.info/php/get_user_events.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: uidFromCookie, uniID: uniIDFromCookie, role: roleFromCookie })
    })
        .then(res => res.json())
        .then(events => {
            const container = document.getElementById("eventsContainer");
            if (!events || events.length === 0) {
                container.innerHTML = "<p>No events available right now.</p>";
                return;
            }

            for (const evt of events) {
                const card = document.createElement("div");
                card.className = "event-card";
                card.innerHTML = `
          <h3>${evt.name}</h3>
          <p>${evt.description}</p>
          <p><strong>Date:</strong> ${evt.date}</p>
          <p><strong>Location:</strong> ${evt.location}</p>
          <button onclick="viewEvent(${evt.id})">View Details</button>
        `;
                container.appendChild(card);
            }
        });
}

function viewEvent(id) {
    window.location.href = `event.html?id=${id}`;
}