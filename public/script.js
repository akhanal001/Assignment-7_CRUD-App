const randomJokeBtn = document.getElementById("load-random-joke");
const randomJokeOutput = document.getElementById("random-joke");

// Ths is for Random Joke
randomJokeBtn.addEventListener("click", async () => {
    try {
        const response = await fetch("/jokebook/random");
        if (!response.ok) throw new Error(response.statusText);

        const jokeArr = await response.json();
        randomJokeOutput.replaceChildren(); // Clear previous joke

        if (jokeArr.length > 0) {
            const joke = jokeArr[0];
            const text = document.createElement('p');
            const text2 = document.createTextNode('p ');
            text.textContent = joke.setup;
            text2.textContent = "=> " + joke.delivery;

            randomJokeOutput.appendChild(text);
            randomJokeOutput.appendChild(text2);
        } else {
            randomJokeOutput.appendChild(document.createTextNode("No jokes found in database."));
        }
    } catch (err) {
        randomJokeOutput.textContent = err.message;
    }
});


const loadCategoriesBtn = document.getElementById("load-categories");
const categoriesList = document.getElementById("categories-list");

// This is for getting all the Categories in the DB
loadCategoriesBtn.addEventListener("click", async () => {
    try {
        const response = await fetch("/jokebook/categories");
        if (!response.ok) throw new Error(response.statusText);

        const categories = await response.json();
        categoriesList.replaceChildren();

        categories.forEach(categoryObj => {
            const li = document.createElement("li");
            li.textContent = categoryObj.category;
            li.addEventListener("click", () => loadJokesByCategory(categoryObj.category));
            categoriesList.appendChild(li);
        });
    } catch (err) {
        categoriesList.replaceChildren();
        const li = document.createElement("li");
        li.textContent = err.message;
        categoriesList.appendChild(li);
    }
});


// this is for Searching a Category and get the jokes from specific category

const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");


searchBtn.addEventListener("click", () => {
    const category = searchInput.value.trim();
    if (!category) return;
    loadJokesByCategory(category, true);
});


async function loadJokesByCategory(category, isSearch) {
    try {
        const response = await fetch("/jokebook/category/" + category);
        if (!response.ok) throw new Error(response.statusText);

        const jokes = await response.json();
        displayJokes(category, jokes);

        if (isSearch) {
            searchResults.replaceChildren();
        }
    } catch (err) {
        const tableBody = document.querySelector("#jokes-table tbody");
        tableBody.replaceChildren();

        const h2 = document.querySelector("#category-jokes-section h2");
        h2.textContent = "Category: " + category + "not available";

        if (isSearch) {
            searchResults.replaceChildren();
            const msg = document.createElement("p");
            msg.textContent = "Category: " + category + "not available";
            searchResults.appendChild(msg);
        }
    }
}

function displayJokes(category, jokes) {
    const topBody = document.querySelector("#top-jokes-table tbody");
    const bottomBody = document.querySelector("#bottom-jokes-table tbody");

    // Clear existing rows
    topBody.replaceChildren();
    bottomBody.replaceChildren();

    // Update Category Title
    const h2 = document.querySelector("#category-jokes-section h2");
    h2.textContent = "Jokes in Selected Category: " + category;

    jokes.forEach(jokeObj => {
        // Create a row for the top table
        const trTop = document.createElement("tr");
        const tdSetupTop = document.createElement("td");
        tdSetupTop.textContent = jokeObj.setup;
        const tdDeliveryTop = document.createElement("td");
        tdDeliveryTop.textContent = jokeObj.delivery;
        trTop.appendChild(tdSetupTop);
        trTop.appendChild(tdDeliveryTop);
        topBody.appendChild(trTop);

        // Create a row for the bottom table (same content)
        const trBottom = document.createElement("tr");
        const tdSetupBottom = document.createElement("td");
        tdSetupBottom.textContent = jokeObj.setup;
        const tdDeliveryBottom = document.createElement("td");
        tdDeliveryBottom.textContent = jokeObj.delivery;
        trBottom.appendChild(tdSetupBottom);
        trBottom.appendChild(tdDeliveryBottom);
        bottomBody.appendChild(trBottom);
    });
}

function AddedJokes(category) {
    // Similar to displayJokes(), but updates the bottom section
    fetch(`/jokebook/category/${category}`)
        .then(res => res.json())
        .then(jokes => {
            const bottomTableBody = document.querySelector("#added-jokes-table tbody");
            bottomTableBody.replaceChildren();

            jokes.forEach(joke => {
                const tr = document.createElement("tr");
                const tdSetup = document.createElement("td");
                tdSetup.textContent = joke.setup;
                const tdDelivery = document.createElement("td");
                tdDelivery.textContent = joke.delivery;
                tr.appendChild(tdSetup);
                tr.appendChild(tdDelivery);
                bottomTableBody.appendChild(tr);
            });
        })
        .catch(err => console.error("Failed to update added jokes table:", err));
}





function jokeCategoryTitle(category) {
    const h2 = document.querySelector("#category-section h2");
    h2.textContent = "Jokes in Category: " + category;
}


//  Add New Joke
const categoryJokesOutput = document.getElementById("category-jokes");
const addJokeForm = document.getElementById("add-joke-form");
const formFeedback = document.getElementById("form-feedback");

addJokeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formFeedback.textContent = "";

    const formData = new FormData(addJokeForm);
    const joke = Object.fromEntries(formData.entries());

    if (!joke.category || !joke.setup || !joke.delivery) {
        formFeedback.textContent = "All fields are required!";
        return;
    }

    try {
        const response = await fetch("/jokebook/joke/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(joke)
        });

        if (!response.ok) throw new Error(response.statusText);
        addJokeForm.reset();
        loadJokesByCategory(joke.category);
        AddedJokes(joke.category);
    } catch (err) {
        formFeedback.textContent = err.message;
    }
});
