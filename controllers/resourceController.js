const hapioClient = require('../config/hapioClient');
const connection = require('../connection');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
//Get all resources
const getResource = async(req, res) =>{
    try{
        const { slug } = req.params;
        console.log('Received slug:', slug);
        connection.query('SELECT * FROM resources WHERE slug = ?', [slug], (err, result) => {
            if(err){
                console.error("Error fetching resources from mysql", err.message);
                res.status(500).json({message:"error fetching resource from mysql"})
            }
            console.log("Successful fetching resources", result);
            res.json({data:result});
        })
    } catch(error){
        console.error("Error fetching data", error.message)
        res.status(500).json({ error : "Failed to fetch hapio data" })
    }
}

// Retrieve a list of schedule blocks
const getResourceScheduleBlocks = async (req, res) => {
    const { resourceId } = req.params;

    try {
        const response = await hapioClient.get(`resources/${resourceId}/schedule-blocks`);

        if (!response.data || Object.keys(response.data).length === 0) {
            return res.status(204).json({ message: "No schedule blocks available for this resource." });
        }

        res.send(response.data);
    } catch (error) {
        console.error("Error fetching schedule block for resource:", error.message);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
//Creating a recurring schedule with POST, sending resourceId (URL) and location_id & start_date (JSON body)
const createRecurringScheduleForResource = async(req, res) =>{
    //Extract resourceId from URL parameters
    const { resourceId } = req.params;
    //Extract data from requested body
    const { location_id, start_date } = req.body;
    try{
        //Make a POST request to Hapio API
        const response = await hapioClient.post(`resources/${resourceId}/recurring-schedules`, {
            location_id,
            start_date,
        });
        res.send(response.data);
    } catch(error){
        console.error("Error creating recurring schedule", error.message);
        //Handle the error from Hapio API
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        }else{
            res.status(500).json({ error : "Internal server error" })
        }
    }
}

//Create schedule block in a specific recurring schedule with POST
const createScheduleBlockForRecurringSchdule = async(req, res) =>{
    //Extract resourceId and Recurring Schedule id from URL
    const { resourceId, recurringScheduleId } = req.params;
    //Extract weekday,start_time,end_time from requested body
    //Note: "weekday" means monday-sunday, anyday within the week.
    const { weekday, start_time, end_time } = req.body;
    try{
        //Make a POST request to Hapio API
        const response = await hapioClient.post(`resources/${resourceId}/recurring-schedules/${recurringScheduleId}/schedule-blocks`, {
            weekday,
            start_time,
            end_time
        })
        //send response to the frontend
        res.send(response.data);

    }catch(error){
        console.error("Error creating schedule block in specific recurring schedule", error.message)

        //Handle error from Hapio API
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        }else{
            res.status(500).json({ error : 'Internal server error' })
        }
    }
}
// Retrieve schedule for a resource, on a specific date
const getScheduleForResource = async(req, res) =>{
    let { resourceId } = req.params;
    let { from, to, location } = req.query;

    try {
        // Trim and clean up resourceId
        resourceId = resourceId.trim();
        // Log raw values
        console.log('Raw from:', from);
        console.log('Raw to:', to);
        // Clean and correct the date format
        from = from.replace(' ', '+'); // Replace the space with '+'
        to = to.replace(' ', '+');     // Replace the space with '+'

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
        if (dayjs(to).isBefore(dayjs(from))) {
            return res.status(400).json({
                error: '`to` must be a date after `from`.',
            });
        }

        // Send GET request to Hapio API
        const response = await hapioClient.get(`resources/${resourceId}/schedule`, {
            params: {
                from,
                to,
                location,
            },
        });

        // Send the API response back to the client
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error getting schedule for a resource:', error.message);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    } 
}
//Add a resource
const createResource = async (req, res) => {
    try {
        const { 
            name,
            max_simultaneous_bookings,
            metadata,
            protected_metadata,
            enabled,
            user_id,
            identification_no,
            email,
            phone_no
        } = req.body;

        // Validate payload
        if (!name || typeof name !== 'string' || name.length < 1 || name.length > 100) {
            return res.status(400).json({ message: "Invalid 'name'. Must be a string between 1 and 100 characters." });
        }
        if (max_simultaneous_bookings !== null && (typeof max_simultaneous_bookings !== 'number' || max_simultaneous_bookings < 1)) {
            return res.status(400).json({ message: "Invalid 'max_simultaneous_bookings'. Must be a number >= 1 or null." });
        }
        if (enabled !== undefined && typeof enabled !== 'boolean') {
            return res.status(400).json({ message: "Invalid 'enabled'. Must be a boolean." });
        }

        // Prepare API payload
        const apiData = {
            name,
            max_simultaneous_bookings,
            metadata,
            protected_metadata,
            enabled
        };

        console.log('Sending API Data:', apiData);

        // Send POST request to Hapio API
        const response = await hapioClient.post(`resources`, apiData);

        if (response.status !== 201) {
            console.error('Error creating resource:', response.data);
            return res.status(500).json({ message: "Error creating resource", details: response.data });
        }

        console.log('Resource Created Successfully:', response.data);

        const { id: resource_id, created_at } = response.data;

        // Insert resource into MySQL
        connection.query(
            'INSERT INTO resources (resource_id, user_id, name, identification_no, email, phone_no, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [resource_id, user_id, name, identification_no, email, phone_no, created_at],
            (err, result) => {
                if (err) {
                    console.error('Error inserting resource into MySQL:', err.message);
                    return res.status(500).json({ message: "Error inserting resource into MySQL" });
                }

                console.log('Resource Inserted into MySQL:', result);
                res.status(201).json({
                    message: "Resource successfully created and inserted into MySQL",
                    resource: {
                        resource_id,
                        name,
                        user_id,
                        email,
                        phone_no,
                        created_at,
                        identification_no
                    }
                });
            }
        );
    } catch (error) {
        console.error('Error creating resource:', error.message);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

//remove a resource
const removeResource = async(req, res) => {
    try{
        const { resourceId } = req.params;
        const response = await hapioClient.delete(`resources/${resourceId}`);
        if(response.status == 204){
            console.log("Successfully removed resource from Hapio")
        }else{
            console.log("Error removing resource", response.data);
            return res.status(response.status).json({message:"Error removing resource"})
        }
        //remove from mysql
        connection.query('DELETE FROM resources WHERE resource_id = ?', 
            [resourceId],
            (err, result) => {
                if(err){
                    console.log("Error removing resource from resource table: ", err.message);
                    return res.status(500).json({message:"Error removing resource from resource table"})
                }
                console.log("Successfully added resource into resource table", result);
                res.status(201).json({
                    message:"resource removed:",
                    resource:{
                        resourceId
                    }
                })
            }
        )

    }catch(error){
        console.error('Error removing resource:', error.message);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
module.exports = {
    getResource,
    getResourceScheduleBlocks,
    createRecurringScheduleForResource,
    createScheduleBlockForRecurringSchdule,
    getScheduleForResource,
    createResource,
    removeResource
}