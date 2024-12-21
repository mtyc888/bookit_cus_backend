const hapioClient = require('../config/hapioClient');

//create booking, takes in location_id, service_id, starts_at, ends_at
const createBooking = async(req, res) =>{
    const { location_id, service_id, starts_at, ends_at } = req.body;
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

    // Ensure ends_at is after starts_at
    if (new Date(formatted_ends_at) <= new Date(formatted_starts_at)) {
        return res.status(400).json({
            error: '`ends_at` must be a date after `starts_at`.',
        });
    }

    try {
        // Make POST request to Hapio API
        const response = await hapioClient.post(`bookings`, {
            service_id, // API-expected field name
            location_id, // API-expected field name
            starts_at: formatted_starts_at,
            ends_at: formatted_ends_at,
        });

        // Send response back to client
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error booking the slot:', error.message);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = {
    createBooking
}