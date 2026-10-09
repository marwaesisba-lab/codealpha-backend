
// ========================================
// CREATE EVENT
// ========================================

const eventForm = document.getElementById("eventForm");

if (eventForm) {

    eventForm.addEventListener("submit", async (event) => {

        // prevent page refresh

        event.preventDefault();

        const title = document.getElementById("title").value;

        const description =
            document.getElementById("description").value;

        const date = document.getElementById("date").value;

        const location =
            document.getElementById("location").value;

        try {

            const response = await fetch("/api/events", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title,
                    description,
                    date,
                    location
                })

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            document.getElementById("message").innerHTML = `
                <div class="message success">
                    Event created successfully!
                    <br>
                    Event ID: ${data.id}
                </div>
            `;

            eventForm.reset();

        } catch (error) {

            document.getElementById("message").innerHTML = `
                <div class="message error">
                    ${error.message}
                </div>
            `;

        }

    });

}


// ========================================
// GET EVENTS
// ========================================

const eventsContainer =
    document.getElementById("eventsContainer");

if (eventsContainer) {

    loadEvents();

}

async function loadEvents() {

    try {

        const response =
            await fetch("/api/eventList");

        const events = await response.json();

        eventsContainer.innerHTML = "";

        if (events.length === 0) {

            eventsContainer.innerHTML =
                "<p>No events available.</p>";

            return;

        }

        events.forEach((event) => {

            eventsContainer.innerHTML += `

                <div class="event">

                    <h2>${event.title}</h2>

                    <p>
                        ${event.description}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${event.date}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${event.location}
                    </p>

                    <p>
                        <strong>Event ID:</strong>
                        ${event.id}
                    </p>

                    <input
                        type="text"
                        id="name-${event.id}"
                        placeholder="Your name"
                    >

                    <input
                        type="email"
                        id="email-${event.id}"
                        placeholder="Your email"
                    >

                    <button onclick="register(${event.id})">
                        Register
                    </button>

                </div>

            `;

        });

    } catch (error) {

        eventsContainer.innerHTML = `
            <div class="message error">
                Failed to load events.
            </div>
        `;

    }

}


// ========================================
// REGISTER FOR EVENT
// ========================================

async function register(eventId) {

    const userName =
        document.getElementById(`name-${eventId}`).value;

    const userEmail =
        document.getElementById(`email-${eventId}`).value;

    if (!userName || !userEmail) {

        alert("Please enter your name and email.");

        return;

    }

    try {

        const response = await fetch("/api/registration", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                eventId,
                userName,
                userEmail

            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || data.message
            );

        }

        alert("Registration successful!");

    } catch (error) {

        alert(error.message);

    }

}


// ========================================
// GET USER REGISTRATIONS
// ========================================

async function loadRegistrations() {

    const email =
        document.getElementById("email").value;

    if (!email) {

        alert("Please enter your email.");

        return;

    }

    const container =
        document.getElementById("registrationsContainer");

    try {

        const response =
            await fetch(
                `/api/registrations?email=${encodeURIComponent(email)}`
            );

        const registrations =
            await response.json();

        container.innerHTML = "";

        if (registrations.length === 0) {

            container.innerHTML =
                "<p>No registrations found.</p>";

            return;

        }

        registrations.forEach((registration) => {

            container.innerHTML += `

                <div class="registration">

                    <h2>
                        ${registration.title}
                    </h2>

                    <p>
                        <strong>Date:</strong>
                        ${registration.date}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${registration.location}
                    </p>

                    <p>
                        <strong>Registration ID:</strong>
                        ${registration.registrationId}
                    </p>

                    <p>
                        <strong>Registered at:</strong>
                        ${registration.registered_at}
                    </p>

                    <button
                        onclick="cancelRegistration(
                            ${registration.registrationId}
                        )"
                    >
                        Cancel Registration
                    </button>

                </div>

            `;

        });

    } catch (error) {

        container.innerHTML = `
            <div class="message error">
                ${error.message}
            </div>
        `;

    }

}


// ========================================
// CANCEL REGISTRATION
// ========================================

async function cancelRegistration(id) {

    const confirmCancel =
        confirm("Are you sure you want to cancel this registration?");

    if (!confirmCancel) {
        return;
    }

    try {

        const response =
            await fetch(`/api/registrations/${id}`, {

                method: "DELETE"

            });

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || "Failed to cancel registration"
            );

        }

        alert(data.message);

        // reload registrations

        loadRegistrations();

    } catch (error) {

        alert(error.message);

    }

}

