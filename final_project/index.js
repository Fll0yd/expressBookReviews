const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Setup session for /customer routes
app.use("/customer", session({
    secret: "fingerprint_customer", // Session secret key
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware for /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if user is logged in by verifying session authorization token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify the JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user; // Attach the user object to the request
                next(); // Allow the request to proceed
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
