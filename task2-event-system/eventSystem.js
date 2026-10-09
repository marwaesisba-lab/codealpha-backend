
const express = require("express");
const Database = require("better-sqlite3");

const app = express();

app.use(express.json());
app.use(express.static("eventRegisteration"))

// Initializing Database 

const db = new Database("events.db");

// creating database 

// ******** First Table For events and the second for registration ******** //

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    location TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
  );
`);

// 1- create a new event 

app.post("/api/events", (req, res) => {

    const { title, description, date, location } = req.body;

    // take all information of event

    if (!title || !date || !location) {

        return res.status(400).json({
            error: "Title, date, and location are required."
        });

    }

    // insert into table the event 

    const stmt = db.prepare(
        "INSERT INTO events (title, description, date, location) VALUES (?, ?, ?, ?)"
    );

    const info = stmt.run(
        title,
        description || "",
        date,
        location
    );

    res.status(201).json({
        id: info.lastInsertRowid,
        title,
        description,
        date,
        location
    });

});


// 2- Get List of all events 

app.get("/api/eventList", (req, res) => {

    const stmt = db.prepare("SELECT * FROM events");

    const events = stmt.all();

    res.json(events);

});


// 3- Register a user for event 

app.post("/api/registration", (req, res) => {

    const { eventId, userName, userEmail } = req.body;

    if (!eventId || !userName || !userEmail) {

        return res.status(400).json({
            error: "eventId, userName, and userEmail are required."
        });

    }

    // check if event Exist 

    const eventCheck = db
        .prepare("SELECT id FROM events WHERE id = ?")
        .get(eventId);

    if (!eventCheck) {

        return res.status(404).json({
            message: "Cannot find the event"
        });

    }

    // associate the user with her event

    const stmt = db.prepare(
        "INSERT INTO registrations (event_id, user_name, user_email) VALUES (?, ?, ?)"
    );

    const info = stmt.run(
        eventId,
        userName,
        userEmail
    );

    res.status(201).json({

        message: "Registration successful",

        registrationId: info.lastInsertRowid,

        eventId,

        userName,

        userEmail

    });

});


// 4- view registration with the user Email 

app.get("/api/registrations", (req, res) => {

    const { email } = req.query;

    // if email does not exist 

    if (!email) {

        return res.status(400).json({
            error: "Query parameter email is required."
        });

    }

    // inner join with events

    const stmt = db.prepare(`
        SELECT 
            r.id AS registrationId,
            e.title,
            e.date,
            e.location,
            r.registered_at
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE r.user_email = ?
    `);

    const userRegistrations = stmt.all(email);

    res.json(userRegistrations);

});


// 5- Cancel a registration

app.delete("/api/registrations/:id", (req, res) => {

    const { id } = req.params;

    const stmt = db.prepare(
        "DELETE FROM registrations WHERE id = ?"
    );

    const deletedUser = stmt.run(id);

    if (deletedUser.changes === 0) {

        return res.status(404).json({
            error: "Registration not found."
        });

    }

    res.json({
        message: "Registration cancelled successfully."
    });

});


// Start Server

const PORT = 4000;

app.listen(PORT, () => {

    console.log(`Event System running at http://localhost:${PORT}`);

});

