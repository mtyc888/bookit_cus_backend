const hapioClient = require('../config/hapioClient');

//Get all resources
const getResource = async(req, res) =>{
    try{
        //Make a GET request
        const response = await hapioClient.get('resources');
        //Send the response back to the frontend
        res.send(response.data)
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

module.exports = {
    getResource,
    getResourceScheduleBlocks,
    createRecurringScheduleForResource,
    createScheduleBlockForRecurringSchdule,
    getScheduleForResource
}