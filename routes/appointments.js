const express = require("express");
const router = express.Router();

// Array of appointments
//This is dummy data ideally we would get this appointments data from Hapio
var appointments = [
    { id: 1, name: "John Doe", phoneNo: "1234567890", service_id: 101, paid: 1 },
    { id: 2, name: "Jane Smith", phoneNo: "9876543210", service_id: 102, paid: 0 },
];

// View all appointments
router.get('/', (req, res) => {
    const appointmentNames = appointments.map(appointment => ({
        id: appointment.id,
        name: appointment.name,
        phoneNo: appointment.phoneNo,
        service_id: appointment.service_id,
        paid: appointment.paid
    }));
    res.send(appointmentNames)
});

// Create a new appointment
router.post('/', (req, res) => {
    const newAppointment = {
        id: appointments.length + 1, // Auto-increment id
        name: req.body.name,
        phoneNo: req.body.phoneNo,
        service_id: req.body.service_id,
        paid: req.body.paid,
    };
    appointments.push(newAppointment);
    res.status(201).json({ message: "Appointment created", appointment: newAppointment });
});

// Dynamic routes for appointments
router
    .route('/:id')
    .get((req, res) => {
        const appointment = appointments.find(a => a.id === parseInt(req.params.id));
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.send(appointment);
    })
    .delete((req, res) => {
        const appointmentIndex = appointments.findIndex(a => a.id === parseInt(req.params.id));
        if (appointmentIndex === -1) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        const deletedAppointment = appointments.splice(appointmentIndex, 1);
        res.send({ message: "Appointment deleted", appointment: deletedAppointment });
    })
    .patch((req, res) => {
        const appointment = appointments.find(a => a.id === parseInt(req.params.id));
        if(!appointment){
            return res.status(404).json({message : "Appointment Not Found"});
        }
        //Update only the fields provided in the request body
        Object.assign(appointment, req.body);
        res.send({ message : "Appointment Updated", appointment })
    });

// Middleware to fetch appointment by ID (if needed)
router.param("id", (req, res, next, id) => {
    const appointment = appointments.find(a => a.id === parseInt(id));
    if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
    }
    req.appointment = appointment;
    next();
});

module.exports = router;
