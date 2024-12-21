const express = require('express')
const app = express()
const cors = require('cors')
const serviceRoutes = require('./routes/serviceRoutes.js')
const locationRoutes = require('./routes/locationRoutes.js')
const resourceRoutes = require('./routes/resourceRouter.js')
//load the .env file
require('dotenv').config();
//allow requests from any origin
app.use(cors());
//middleware to parse JSON bodies
app.use(express.json());
app.get('/', (req, res) => {
    res.send({message : "hello, this is bookit backend"})
})

app.use('', serviceRoutes);
app.use('', locationRoutes);
app.use('',resourceRoutes);
app.listen(3001)
