
// initializing 

const express = require("express");
const Database = require("better-sqlite3");
const { nanoid } = require("nanoid");

const app = express();

app.use(express.json());

app.use(express.static("Urlshortenpages"));

// initialize SQL database 

const db = new Database("urls.db");

// creating database

db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    long_url TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 1- create a shortened URL 

app.post("/api/shorten", (req, res) => {

    const { longUrl } = req.body;

    // the URL must exist 

    if (!longUrl) {

        return res.status(400).json({
            error: "longUrl is required"
        });

    }

    // generate a shortened code of 6 chars using nanoid

    const shortCode = nanoid(6);

    try {

        // inserting in database LongUrl and ShortCode

        const stmt = db.prepare(
            "INSERT INTO urls (long_url, short_code) VALUES (?, ?)"
        );

        stmt.run(longUrl, shortCode);

        return res.status(201).json({

            message: "URL shortened successfully",

            shortUrl: `http://localhost:3000/r/${shortCode}`,

            shortCode: shortCode

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            error: "Failed to process URL"

        });

    }

});

// 2- redirect short URL to long URL 

app.get("/r/:shortCode", (req, res) => {

    const { shortCode } = req.params;

    // getting longUrl from shortCode 

    const stmt = db.prepare(
        "SELECT long_url FROM urls WHERE short_code = ?"
    );

    const record = stmt.get(shortCode);

    // if short code does not exist

    if (!record) {

        return res.status(404).json({

            error: "Short URL not found"

        });

    }

    // redirect the user to the original long URL

    return res.redirect(record.long_url);

});


// starting the server

const PORT = 3000;

app.listen(PORT, () => {

    console.log(`URL Shortener running at http://localhost:${PORT}`);

});

