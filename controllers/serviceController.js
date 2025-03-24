const hapioClient = require('../config/hapioClient');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
const connection = require('../connection');

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });
dayjs.extend(utc);
dayjs.extend(timezone);
// Create a service
const createService = async (req, res) => {
    try {
        const {
            name,
            price,
            type,
            duration,
            bookable_interval,
            buffer_time_before,
            buffer_time_after,
            booking_window_start,
            booking_window_end,
            cancelation_threshold,
            metadata,
            protected_metadata,
            enabled,
            user_id 
        } = req.body;

        console.log('Creating service with data:', {
            name,
            price,
            type,
            duration,
            bookable_interval,
            buffer_time_before,
            buffer_time_after,
            booking_window_start,
            booking_window_end,
            cancelation_threshold,
            metadata,
            protected_metadata,
            enabled,
            user_id
        });

        // Validate user_id
        if (!user_id) {
            return res.status(400).json({ message: "user_id is required" });
        }

        // Send POST request to the Hapio API
        const response = await hapioClient.post('services', {
            name,
            price,
            type,
            duration,
            bookable_interval,
            buffer_time_before,
            buffer_time_after,
            booking_window_start,
            booking_window_end,
            cancelation_threshold,
            metadata,
            protected_metadata,
            enabled
        });

        const { 
            id: service_id,
            created_at,
            updated_at, 
        } = response.data;

        // Create service entry in MySQL with user_id
        connection.query(
            'INSERT INTO services (service_id, user_id, name, price, type, duration, created_at, updated_at, bookable_interval, buffer_time_before, buffer_time_after, booking_window_start, booking_window_end, cancelation_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [service_id, user_id, name, price, type, duration, created_at, updated_at, bookable_interval, buffer_time_before, buffer_time_after, booking_window_start, booking_window_end, cancelation_threshold],
            (err, result) => {
                if (err) {
                    console.log("Error inserting service into services table:", err.message);
                    return res.status(500).json({ message: "Database insertion fail" });
                }
                console.log('Service entry successfully inserted into database:', result);
                res.status(201).json({
                    message: "Service insertion successful",
                    service: {
                        service_id, 
                        user_id,
                        name,
                        price,
                        type,
                        duration,
                        created_at,
                        updated_at
                    }
                });
            }
        );
    } catch (error) {
        console.error('Error creating service:', error.message);
        if (error.response) {
            console.error('Hapio API error details:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
//remove a service
const removeService = async (req, res) => {
    const { service_id } = req.params;

    try {
        // Step 1: Delete from Hapio API
        const response = await hapioClient.delete(`services/${service_id}`);
        console.log("Hapio remove service successful");

        // Step 2: Remove the service from MySQL
        connection.query(
            'DELETE FROM services WHERE service_id = ?',
            [service_id],
            (err, result) => {
                if (err) {
                    console.log("Error removing service from MySQL:", err.message);
                    return res.status(500).json({ message: "Error removing service from MySQL" });
                }

                console.log("DELETE service successful in MySQL:", result);
                res.status(201).json({ message: "Service removal successful" });
            }
        );
    } catch (err) {
        console.error("Error removing service:", err.message);

        // Handle errors from Hapio API
        if (err.response) {
            res.status(err.response.status).json(err.response.data);
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
};

// Get all services for a specific user_id
const getAllService = async (req, res) => {
    try {
        const { user_id } = req.query; // Get user_id from query params
        console.log('Received user_id:', user_id);

        if (!user_id) {
            console.log('No user_id provided');
            return res.status(400).json({ error: 'user_id is required' });
        }

        // Query to fetch services for the given user_id
        const serviceQuery = `
            SELECT service_id, name, price, type, duration,
                   bookable_interval, buffer_time_before, buffer_time_after,
                   booking_window_start, booking_window_end, cancelation_threshold
            FROM services 
            WHERE user_id = ?
        `;

        connection.query(serviceQuery, [user_id], (serviceErr, serviceResult) => {
            if (serviceErr) {
                console.error("Error fetching services:", serviceErr.message);
                return res.status(500).json({ error: "Failed to fetch services" });
            }

            console.log('User ID:', user_id);
            console.log('Services found:', serviceResult.length);
            console.log('Services:', serviceResult);

            res.json({ data: serviceResult });
        });
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({ error: "Failed to fetch services" });
    }
};
const getAllServiceBySlug = async (req, res) => {
    try {
        const { slug } = req.params; // Get slug from URL params
        console.log('Received slug:', slug);

        if (!slug) {
            console.log('No slug provided');
            return res.status(400).json({ error: 'slug is required' });
        }

        // Step 1: Query the users table to find the user_id for the given slug
        const userQuery = `
            SELECT user_id 
            FROM users 
            WHERE slug = ?
        `;

        connection.query(userQuery, [slug], (userErr, userResult) => {
            if (userErr) {
                console.error("Error fetching user by slug:", userErr.message);
                return res.status(500).json({ error: "Failed to fetch user by slug" });
            }

            if (userResult.length === 0) {
                console.log('No user found for slug:', slug);
                return res.status(404).json({ error: 'User not found for the given slug' });
            }

            const user_id = userResult[0].user_id;
            console.log('Found user_id:', user_id);

            // Step 2: Query to fetch services for the given user_id
            const serviceQuery = `
                SELECT service_id, name, price, type, duration,
                       bookable_interval, buffer_time_before, buffer_time_after,
                       booking_window_start, booking_window_end, cancelation_threshold
                FROM services 
                WHERE user_id = ?
            `;

            connection.query(serviceQuery, [user_id], (serviceErr, serviceResult) => {
                if (serviceErr) {
                    console.error("Error fetching services:", serviceErr.message);
                    return res.status(500).json({ error: "Failed to fetch services" });
                }

                console.log('User ID:', user_id);
                console.log('Services found:', serviceResult.length);
                console.log('Services:', serviceResult);

                res.json({ data: serviceResult });
            });
        });
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({ error: "Failed to fetch services" });
    }
};
//PUT Route to associate resource (practitioner) with service
const assignResourceToService = async (req, res) => {
    //Extract IDs from URL parameters
    const { serviceId, resourceId } = req.params;
    try{
        //Send PUT request to Hapio API
        const response = await hapioClient.put(`services/${serviceId}/resources/${resourceId}`);

        //Return the Hapio API response to the frontend
        res.send(response.data);
    } catch(error){
        console.error("Error connecting service to resource");
        //Handle errors from Hapio API
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        }
        else {
            res.status(500).json({ error : 'Internal server error' });
        }
    }
}
// Get all bookable slots
const getBookableSlots = async(req, res) =>{
    const { serviceId } = req.params;
    let { from, to, location } = req.query;

    // Log raw values
    console.log('Raw from:', from);
    console.log('Raw to:', to);

    // Validate required query parameters
    if (!from || !to || !location) {
        return res.status(400).json({
            error: 'Missing required query parameters: from, to, location',
        });
    }

    // Clean and correct the date format
    from = from.replace(' ', '+');
    to = to.replace(' ', '+');

    // Validate and parse dates
    if (!dayjs(from).isValid() || !dayjs(to).isValid()) {
        return res.status(400).json({
            error: 'Invalid date format. Dates must be in ISO 8601 format: Y-m-d\\TH:i:s±HH:mm',
        });
    }

    // Convert `from` and `to` to Asia/Kuala_Lumpur timezone and format them correctly
    from = dayjs(from).tz('Asia/Kuala_Lumpur').format('YYYY-MM-DDTHH:mm:ssZ'); // Keeps offset
    to = dayjs(to).tz('Asia/Kuala_Lumpur').format('YYYY-MM-DDTHH:mm:ssZ');     // Keeps offset

    console.log('Formatted from:', from);
    console.log('Formatted to:', to);

    // Ensure `to` is after `from`
    if (new Date(to) <= new Date(from)) {
        return res.status(400).json({
            error: '`to` must be a date after `from`.',
        });
    }
    const cacheKey = `${serviceId}-${from}-${to}-${location}`;
    if(cache.has(cacheKey)){
        console.log('Serving from cache', cacheKey);
        return res.json(cache.get(cacheKey));
    }
    try {
        // Make the GET request to Hapio API
        const response = await hapioClient.get(`services/${serviceId}/bookable-slots`, {
            params: {
                from,
                to,
                location,
            },
        });
        //cache the response
        cache.set(cacheKey, response.data);
        // Send the API response back to the client
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error getting bookable slots:', error.message);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
module.exports = {
    createService,
    getAllService,
    assignResourceToService,
    getBookableSlots,
    removeService,
    getAllServiceBySlug
};
