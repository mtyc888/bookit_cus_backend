const express = require('express');
const router = express.Router();
const { createBooking, getBooking, getSpecificBooking, removeBooking } = require('../controllers/bookingController');

router.post('/bookings', createBooking);
router.get('/bookings', getBooking);
router.get('/bookings/:bookingId', getSpecificBooking);
router.delete('/bookings/:bookingId', removeBooking);
module.exports = router;