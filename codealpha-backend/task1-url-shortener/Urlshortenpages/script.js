
// getting the form

const form = document.getElementById("shortenForm");

// getting the result elements

const result = document.getElementById("result");
const shortUrl = document.getElementById("shortUrl");

// getting the error element

const error = document.getElementById("error");


// when the form is submitted

form.addEventListener("submit", async (event) => {

    // prevent the page from refreshing

    event.preventDefault();

    // getting the URL entered by the user

    const longUrl = document.getElementById("longUrl").value;

    // hide previous messages

    result.classList.add("hidden");
    error.classList.add("hidden");

    try {

        // sending the URL to our backend

        const response = await fetch("/api/shorten", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                longUrl: longUrl
            })

        });

        // converting the response to JSON

        // getting the response as text first

        const text = await response.text();

        console.log("Status:", response.status);
        console.log("Response:", text);

        // converting the text to JSON

        const data = JSON.parse(text);

        // if the backend returns an error

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong");
        }

        // displaying the shortened URL

        shortUrl.textContent = data.shortUrl;

        shortUrl.href = data.shortUrl;

        result.classList.remove("hidden");

    } catch (err) {

        // displaying the error

        error.textContent = err.message;

        error.classList.remove("hidden");
    }

});

