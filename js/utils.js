function logoutUser() {
    document.cookie = "name=; expires Fri, 01 Jan 1999 00:00:00 GMT; path=/;";
    document.cookie = "email=; expires Fri, 01 Jan 1999 00:00:00 GMT; path=/;";
    document.cookie = "uid=; expires Fri, 01 Jan 1999 00:00:00 GMT; path=/;";
    document.cookie = "uniID=; expires Fri, 01 Jan 1999 00:00:00 GMT; path=/;";
    document.cookie = "role=; expires Fri, 01 Jan 1999 00:00:00 GMT; path=/;";

    window.location.href = "index.html"
}

async function fetchEvents() {
    ;
    const uid = uidFromCookie
    const uniID = uniIDFromCookie

    if (!uid) {
        console.error("User ID (uid) not found in cookie. Cannot fetch events.");
        return null;
    }

    try {
        const url = urlBase + '/EventsFetch.' + extension;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uid: uid, uniID: uniID })
        };

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching events:", error);
        return null;
    }
}

async function loadAndDisplayEvents() {
    const eventsData = await fetchEvents();
    if (eventsData && eventsData.approved_events) {
        console.log("Fetched events:", eventsData.approved_events);

        console.log("printing events");
        displayEvents(eventsData.approved_events);
    } else {
        console.log("Failed to load events.");
    }
}