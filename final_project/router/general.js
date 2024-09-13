const express = require('express');
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

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    // Directly using the books object instead of making an Axios request
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn; // Retrieve ISBN from request parameters

  try {
      const bookDetails = books[isbn];  // Retrieve the book details from the books object

      if (bookDetails) {
          return res.status(200).json(bookDetails);
      } else {
          return res.status(404).json({ message: "Book not found" });
      }
  } catch (error) {
      return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author; // Retrieve the author name from request parameters
  const bookList = [];

  // Iterate through the books object
  for (let isbn in books) {
    if (books[isbn].author === author) {
      bookList.push(books[isbn]); // Add the book to the list if the author matches
    }
  }

  // If books are found, return them, otherwise return a not found message
  if (bookList.length > 0) {
    return res.status(200).json(bookList);
  } else {
    return res.status(404).json({ message: "Books by this author not found" });
  }
});

// Get book details based on title using async-await with Axios
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title; // Retrieve the title from request parameters
  
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details by title", error: error.message });
  }
});

// Get book review based on ISBN
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
