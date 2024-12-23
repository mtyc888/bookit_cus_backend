const express = require('express')
const app = express()
const cors = require('cors')
const connection = require('./connection.js')
const serviceRoutes = require('./routes/serviceRoutes.js')
const locationRoutes = require('./routes/locationRoutes.js')
const resourceRoutes = require('./routes/resourceRouter.js')
const stripeRoutes = require('./routes/stripeRouter.js')
const notificationRoutes = require('./routes/notificationRoutes.js')
//load the .env file
require('dotenv').config();
//allow requests from any origin
app.use(cors());
//middleware to parse JSON bodies
app.use(express.json());
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

app.use('', serviceRoutes);
app.use('', locationRoutes);
app.use('',resourceRoutes);
app.use('', stripeRoutes);
app.use('', notificationRoutes)
app.listen(3001)
