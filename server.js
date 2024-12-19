const express = require('express')
const app = express()
const cors = require('cors')

//allow requests from any origin
app.use(cors());
//middleware to parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
    res.send({message : "hello, this is bookit backend"})
})

const appointmentRouter = require('./routes/appointments.js');

app.use('/appointments', appointmentRouter)

app.listen(3001)
