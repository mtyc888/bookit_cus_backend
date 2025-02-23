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
const authRoutes = require('./routes/authRoutes.js')
// Load the .env file
require('dotenv').config();

// CORS configuration
app.use(cors({
    origin: [
      'https://master.d2syh14nci1air.amplifyapp.com',  // Your Amplify domain
      'http://localhost:3000'  // For local development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }));

// Request logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
    res.json({ message: "hello, this is bookit backend" });
});

app.get('/test', (req, res) => {
    res.json({ message: "hello, this is bookit backend test route" });
});

// Slug validation middleware
const validateSlug = (req, res, next) => {
    const slug = req.params.slug;
    const slugRegex = /^[a-zA-Z0-9-]+$/;
    
    if (!slugRegex.test(slug)) {
        return res.status(400).json({ error: 'Invalid slug format' });
    }
    next();
};

// API endpoint to fetch business by slug
app.get('/api/business/:slug', validateSlug, (req, res) => {
    const slug = req.params.slug.toLowerCase(); // Convert to lowercase for case-insensitive matching

    const query = `
        SELECT user_id, name, email, slug
        FROM users
        WHERE LOWER(slug) = ?
    `;

    connection.query(query, [slug], (err, result) => {
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
            slug: result[0].slug
        };

        res.json(business);
    });
});

// Legacy endpoint for backwards compatibility (if needed)
app.get('/api/business/id/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const query = `
            SELECT user_id, name, email
            FROM users
            WHERE user_id = ?
        `;

        const [rows] = await connection.promise().query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Business not found' });
        }

        const business = {
            id: rows[0].user_id,
            name: rows[0].name,
            email: rows[0].email,
        };

        res.json(business);
    } catch (error) {
        console.error('Error fetching business:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Mount other routes
app.use('/api', serviceRoutes);
app.use('/api', locationRoutes);
app.use('/api', resourceRoutes);
app.use('/api', stripeRoutes);
app.use('/api', notificationRoutes);
app.use('/api', bookingRoutes);
app.use('/api/auth', authRoutes);
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