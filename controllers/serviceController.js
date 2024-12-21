const hapioClient = require('../config/hapioClient');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');


dayjs.extend(utc);
dayjs.extend(timezone);
// Delete a service
const deleteService = async (req, res) => {
    //extract serviceId from URL parameters
    const { serviceId } = req.params;
    try{
        //Make the delete request to Hapio API
        const response = await hapioClient.delete(`services/${serviceId}`);

        //Send the response to the frontend
        res.status(response.status).json(response.data);
    } catch (error){
        console.log("Error creating resource", error.message);

        //handle errors from Hapio API
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        }else{
            res.status(500).json({ error : "Internal server error" });
        }
    }
}
// Create a service
const createService = async (req, res) => {
    try {
        const resourceData = req.body; // Extract data from the request body

        // Send POST request to the Hapio API
        const response = await hapioClient.post('services', resourceData);

        // Send the response back to the frontend
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error creating service:', error.message);

        // Handle errors from the Hapio API
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

//Get all services
const getAllService = async(req, res) => {
    try{
        //Make a GET request
        const response = await hapioClient.get('services');
        //Send the response back to the frontend
        res.send(response.data)
    } catch(error){
        console.error("Error fetching data", error.message)
        res.status(500).json({ error : "Failed to fetch hapio data" })
    }
}

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

    try {
        // Make the GET request to Hapio API
        const response = await hapioClient.get(`services/${serviceId}/bookable-slots`, {
            params: {
                from,
                to,
                location,
            },
        });

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
    deleteService,
    assignResourceToService,
    getBookableSlots
};
