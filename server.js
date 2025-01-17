const express = require('express');
const app = express();
const cors = require('cors');
const connection = require('./connection.js');
const serviceRoutes = require('./routes/serviceRoutes.js');
const locationRoutes = require('./routes/locationRoutes.js');
const resourceRoutes = require('./routes/resourceRouter.js');
const stripeRoutes = require('./routes/stripeRouter.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const bookingRoutes = require('./routes/bookingRoutes.js');

// Load the .env file
require('dotenv').config();

// CORS configuration - use only one configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
// For debug, prints each API called on the console
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
// Middleware to parse JSON bodies
app.use(express.json());

// Basic routes should come before other route handlers
app.get('/', (req, res) => {
    res.json({ message: "hello, this is bookit backend" });
});

app.get('/test', (req, res) => {
    res.json({ message: "hello, this is bookit backend test route" });
});

// API endpoint to fetch business by slug
app.get('/api/business/:id', (req, res) => {
    const userId = req.params.id;

    const query = `
        SELECT user_id, name, email
        FROM users
        WHERE user_id = ?
    `;

    connection.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching business:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Business not found' });
        }

        const business = {
            id: result[0].user_id,
            name: result[0].name,
            email: result[0].email,
        };

        res.json(business);
    });
});

// Mount other routes
app.use('/api', serviceRoutes);
app.use('/api', locationRoutes);
app.use('/api', resourceRoutes);
app.use('/api', stripeRoutes);
app.use('/api', notificationRoutes);
app.use('/api', bookingRoutes);

// Test MySQL Connection
connection.query('SELECT 1', (err) => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    } else {
        console.log("Database connection successful");
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Error handling middleware (should be last)
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});