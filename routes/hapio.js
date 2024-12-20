const express = require('express');
const router = express.Router();
const axios = require('axios');

//Load env credentials
const { HAPIO_API_TOKEN, HAPIO_BASE_URL } = process.env;

// Create an Axios instance for the Hapio API
const hapioClient = axios.create({
    baseURL: 'https://eu-central-1.hapio.net/v1/',
    headers: {
        Authorization: `Bearer ${process.env.HAPIO_API_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

//fetch hapio project details
router.get('/project', async (req, res) => {
    try{
        //Make a GET request
        const response = await axios.get(`${HAPIO_BASE_URL}/project`, {
            headers: {
                Authorization: `Bearer ${HAPIO_API_TOKEN}`,
                Accept: '*/*',
            },
        });

        //Send the response back to the frontend
        res.send(response.data)
    } catch(error){
        console.error("Error fetching data", error.message)
        res.status(500).json({ error : "Failed to fetch hapio data" })
    }
})
//Create a resource (practitioner)
router.post('/resources', async (req, res) => {
    try{
        //Data from the request body
        const resourceData = req.body;

        //Send POST request to Hapio API
        const response = await hapioClient.post('resources', resourceData);

        //Send the response back to the frontend
        res.send(response.data);

    } catch(error){
        console.error("Error creating resource", error.message)

        //handle errors from Hapio API
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        } else{
            res.status(500).json({ error : 'Internal server error' });
        }
    }
})
//Get all resources
router.get('/resources', async (req, res) => {
    try{
        //Make a GET request
        const response = await hapioClient.get('resources');
        //Send the response back to the frontend
        res.send(response.data)
    } catch(error){
        console.error("Error fetching data", error.message)
        res.status(500).json({ error : "Failed to fetch hapio data" })
    }
})
//Get all services
router.get('/services', async (req, res) => {
    try{
        //Make a GET request
        const response = await hapioClient.get('services');
        //Send the response back to the frontend
        res.send(response.data)
    } catch(error){
        console.error("Error fetching data", error.message)
        res.status(500).json({ error : "Failed to fetch hapio data" })
    }
})
//Create a service
router.post('/services', async (req, res) => {
    try{
        //Data from the request body
        const resourceData = req.body;

        //Send POST request to Hapio API
        const response = await hapioClient.post('services', resourceData);

        //Send the response back to the frontend
        res.send(response.data);

    } catch(error){
        console.error("Error creating resource", error.message)

        //handle errors from Hapio API
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        } else{
            res.status(500).json({ error : 'Internal server error' });
        }
    }
})
//delete a service
router.delete(`/services/:serviceId`, async (req, res) => {
    //extract serviceId from URL parameters
    const { serviceId } = req.params;
    try{
        //Make the delete request to Hapio API
        const response = await hapioClient.delete(`services/${serviceId}`);

        //Send the response to the frontend
        res.send(response.data);
    } catch (error){
        console.log("Error creating resource", error.message);

        //handle errors from Hapio API
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        }else{
            res.status(500).json({ error : "Internal server error" });
        }
    }
})
//create a location
router.post('/locations', async (req, res) => {
    try{
        //Data from the request body
        const resourceData = req.body;

        //Send POST request to Hapio API with the resource data
        const response = await hapioClient.post('locations', resourceData);

        //Send the response back to the frontend
        res.send(response.data);

    }catch(error){
        console.error("Error creating resources", error.message);
        //handle errors from Hapio API
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        } 
        else {
            res.status(500).json({ error : 'Internal server error' });
        }
    }
})
//get locations
router.get('/locations', async (req,res) => {
    try{
        //Send GET request to Hapio API
        const response = await hapioClient.get('locations');
        //Send the response to the frontend
        res.send(response.data);

    }catch(error){
        console.error("Error fetching locations", error.message);
        //handle errors from Hapio API
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        }
        else{
            res.status(500).json({ error : "Internal sever error" })
        }
    }
})
//PUT Route to associate resource (practitioner) with service
router.put('/services/:serviceId/resources/:resourceId', async (req, res) => {
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
})

//Creating a recurring schedule with POST, sending resourceId (URL) and location_id & start_date (JSON body)
router.post('/resources/:resourceId/recurring-schedules', async (req, res) => {
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
})

//Create schedule block in a specific recurring schedule with POST
router.post('/resources/:resourceId/recurring-schedules/:recurringScheduleId/schedule-blocks', async (req, res) => {
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
})

//Get all bookable slots
router.get('/services/:serviceId/bookable-slots', async(req, res) => {
    const { serviceId } = req.params;
    const { from, to, location } = req.body;
    try{
        const response = hapioClient.get(`services/${serviceId}/bookable-slots`, {
            from,
            to,
            location
        });
        res.send(response.data);
    } catch(error){
        console.error("Error getting bookable slots", error.message);
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        }else{
            res.status(500).json({ error : "Internal server error" })
        }
    }
})

module.exports = router;