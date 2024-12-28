const express = require('express')
const app = express()
const cors = require('cors')
const connection = require('./connection.js')
const serviceRoutes = require('./routes/serviceRoutes.js')
const locationRoutes = require('./routes/locationRoutes.js')
const resourceRoutes = require('./routes/resourceRouter.js')
const stripeRoutes = require('./routes/stripeRouter.js')
const notificationRoutes = require('./routes/notificationRoutes.js')
const bookingRoutes = require('./routes/bookingRoutes.js')
//load the .env file
require('dotenv').config();
//allow requests from any origin
app.use(cors());
//middleware to parse JSON bodies
app.use(express.json());


// Allow requests from Next.js (localhost:3000)
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));


app.get('/', (req, res) => {
    res.send({message : "hello, this is bookit backend"})
})
//Test MySQL Query
connection.query('SELECT * FROM users', (err, result) => {
    if(err){
        console.error("Error fetching users", err);
    }else{
        console.log("Results:", result)
    }
});

// API endpoint to fetch business by slug
app.get('/api/business/:id', (req, res) => {
    const userId = req.params.id;

    // Query the database to fetch business info by user_id
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

        // Prepare response
        const business = {
            id: result[0].user_id,
            name: result[0].name,
            email: result[0].email,
        };

        res.json(business);
    });
});


app.use('', serviceRoutes);
app.use('', locationRoutes);
app.use('',resourceRoutes);
app.use('', stripeRoutes);
app.use('', notificationRoutes);
app.use('',bookingRoutes);
app.listen(3001)
