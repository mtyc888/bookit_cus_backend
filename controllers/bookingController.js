const hapioClient = require('../config/hapioClient');
const connection = require('../connection');
const { DateTime, Duration } = require('luxon');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);


//create booking, takes in location_id, service_id, starts_at, ends_at
const createBooking = async (req, res) => {
    const {
        location_id,
        service_id,
        resource_id,
        price,
        starts_at,
        ends_at,
        customer_name,
        customer_email,
        customer_phone,
        status,
        payment_status,
        user_id,
    } = req.body;

    const apiData = {
        location_id,
        service_id,
        resource_id,
        price,
        starts_at,
        ends_at,
    };

    console.log('Raw starts_at:', starts_at);
    console.log('Raw ends_at:', ends_at);

    // Validate required fields
    if (!location_id || !service_id || !starts_at || !ends_at) {
        return res.status(400).json({
            error: 'Missing required fields: location_id, service_id, starts_at, ends_at',
        });
    }

    // Validate and correct the date format
    if (!dayjs(starts_at).isValid() || !dayjs(ends_at).isValid()) {
        return res.status(400).json({
            error: 'Invalid date format. Dates must be in ISO 8601 format: Y-m-d\\TH:i:s±HH:mm',
        });
    }

    // Convert to Asia/Kuala_Lumpur timezone
    const formatted_starts_at = dayjs(starts_at).tz('Asia/Kuala_Lumpur').format('YYYY-MM-DDTHH:mm:ssZ');
    const formatted_ends_at = dayjs(ends_at).tz('Asia/Kuala_Lumpur').format('YYYY-MM-DDTHH:mm:ssZ');

    console.log('Formatted starts_at:', formatted_starts_at);
    console.log('Formatted ends_at:', formatted_ends_at);
    apiData.starts_at = formatted_starts_at;
    apiData.ends_at = formatted_ends_at;

    // Ensure ends_at is after starts_at
    if (new Date(formatted_ends_at) <= new Date(formatted_starts_at)) {
        return res.status(400).json({
            error: '`ends_at` must be a date after `starts_at`.',
        });
    }

    try {
        // Make POST request to Hapio API
        const response = await hapioClient.post(`bookings`, apiData);

        const {
            id: appointment_id,
            created_at,
            updated_at,
        } = response.data;

        // Convert ISO strings to DateTime objects
        const startTime = DateTime.fromISO(formatted_starts_at);
        const endTime = DateTime.fromISO(formatted_ends_at);

        // Format the timestamps
        const appointment_time = startTime.toFormat('yyyy-MM-dd HH:mm:ss');
        const appointment_date = startTime.toFormat('yyyy-MM-dd');
        const appointment_time_end = endTime.toFormat('yyyy-MM-dd HH:mm:ss');

        // Insert into MySQL
        connection.query(
            'INSERT INTO appointments (appointment_id, user_id, service_id, resource_id, location_id, customer_name, customer_email, customer_phone, appointment_date, appointment_time, appointment_time_end, status, payment_status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
                appointment_id,
                user_id,
                service_id,
                resource_id,
                location_id,
                customer_name,
                customer_email,
                customer_phone,
                appointment_date,
                appointment_time,
                appointment_time_end,
                status,
                payment_status,
                created_at,
                updated_at,
            ],
            (err, result) => {
                if (err) {
                    console.error('Error inserting new appointment into appointment table:', err.message);
                    return res.status(500).json({ message: 'Error inserting booking into MySQL' });
                }

                console.log('Successfully inserted into the appointments table:', result);
                return res.status(201).json({
                    message: 'Insertion into appointments table successful',
                    appointment: {
                        appointment_id,
                        user_id,
                        service_id,
                        resource_id,
                        location_id,
                        appointment_date,
                        appointment_time,
                        appointment_time_end,
                    },
                });
            }
        );
    } catch (error) {
        console.error('Error booking the slot:', error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        } else {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

//get all bookings
const getBooking = async (req, res) => {
    try {
        const { to,from } = req.params;
        const response = await hapioClient.get('bookings', {
            params: {
                page: 1,
                per_page: 100,
                from,
                to,
            },
        });

        // Log full response for debugging
        console.log(response.data);

        res.send(response.data); // Send response to client
    } catch (error) {
        console.error('Error getting bookings:', error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        } else {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

//retrieve a booking
const getSpecificBooking = async(req, res) =>{
    try{
        const { bookingId } = req.params;
        const response = await hapioClient.get(`bookings/${bookingId}`);
        res.send(response.data);
    } catch(error){
        console.error('Error getting specific booking:', error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        } else {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

//remove a booking
const removeBooking = async (req, res) =>{
    try{
        const { bookingId } = req.params;
        const response = await hapioClient.delete(`bookings/${bookingId}`);
        //remove from mysql
        connection.query('DELETE FROM appointments WHERE appointment_id = ?',
        [bookingId], 
        (err, result)=>{
            if(err){
                console.log("Error removing booking from mysql: ", err.message);
                return res.status(500).json({message:"remove from mysql error"});
            }
            console.log("Successfully removed from mysql", result);
            res.status(201).json({
                message: "Successfully removed from mysql table",
                booking:{
                    bookingId
                }
            })

        })
    }catch(error){
        console.error('Error removing specific booking:', error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        } else {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
//patch a booking (reschedule)
const rescheduleBooking = async(req, res) => {
    try {
        const { bookingId } = req.params;
        const { starts_at, ends_at } = req.body;
        
        // Initialize errors object
        const errors = {};

        // Validate date formats
        if (!dayjs(starts_at).isValid() || !dayjs(ends_at).isValid()) {
            return res.status(400).json({
                error: 'Invalid date format. Dates must be in ISO 8601 format: Y-m-d\\TH:i:s±HH:mm'
            });
        }

        // Check that ends_at is after starts_at
        if (new Date(ends_at) <= new Date(starts_at)) {
            errors.ends_at = ['ends_at time must be after starts_at time'];
        }

        // If there are validation errors, return them
        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                message: "given data was invalid",
                errors
            });
        }

        // Check if booking exists
        const booking = await hapioClient.get(`bookings/${bookingId}`);
        if (!booking) {
            return res.status(404).json({
                message: 'The booking was not found.'
            });
        }

        // Update the booking
        const updateData = {
            starts_at,
            ends_at
        };

        const response = await hapioClient.patch(`bookings/${bookingId}`, updateData);
        res.status(response.status).json(response.data);

    } catch (error) {
        console.error("Error rescheduling specific booking:", error.message);
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        } else {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
module.exports = {
    createBooking,
    getBooking,
    getSpecificBooking,
    removeBooking,
    rescheduleBooking
}