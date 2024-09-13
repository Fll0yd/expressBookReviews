const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: 'newUser', password: 'newPassword' } // Example user, replace with actual registration
];

// Validate if the username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Validate username and password
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Route for user login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });
        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in", token: accessToken });
    } else {
        return res.status(403).json({ message: "Invalid login credentials" });
    }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, 'access', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user.username;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (!books[isbn].reviews) books[isbn].reviews = {};
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/modified successfully", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const username = req.user.username;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
    } else {
        return res.status(403).json({ message: "No review found for this user to delete" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
