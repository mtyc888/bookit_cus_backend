const express = require('express')
const app = express()

//middleware to parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
    res.send("hello")
})

const appointmentRouter = require('./routes/appointments.js');

app.use('/appointments', appointmentRouter)

app.listen(3000)
