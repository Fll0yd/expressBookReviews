const express = require('express');
const axios = require('axios'); // Import Axios for async requests
let books = require("./booksdb.js");  // Import the books database directly
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Username already exists. Please choose another one." });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Task 10: Get the list of books using async-await with Axios
public_users.get('/', async function (req, res) {
  try {
    // Fetch book list using Axios (assuming an external endpoint here)
    const response = await axios.get('http://localhost:5000/books');
    return res.status(200).json(response.data);  // Return book list
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn; // Retrieve ISBN from request parameters
  try {
    // Fetch book details based on ISBN using Axios
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Task 12: Get book details based on Author using async-await with Axios
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author; // Retrieve the author from request parameters
  try {
    // Fetch books by author using Axios
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.status(200).json(response.data);  // Return books by author
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Task 13: Get book details based on Title using async-await with Axios
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title; // Retrieve the title from request parameters
  try {
    // Fetch book details by title using Axios
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details by title", error: error.message });
  }
});

// Get book review based on ISBN (Task 5 – already completed earlier)
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve ISBN from request parameters

  // Check if the book with the given ISBN exists in the books database
  if (books[isbn]) {
    const reviews = books[isbn].reviews; // Get the reviews of the book
    return res.status(200).json(reviews); // Return the reviews in JSON format
  } else {
    return res.status(404).json({ message: "Book not found" }); // Return an error if the book doesn't exist
  }
});

module.exports.general = public_users;
