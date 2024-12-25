const hapioClient = require('../config/hapioClient');
const connection = require('../connection');
//get locations
const getLocations = async (req, res) => {
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
}
//get a location
const getSpecificLocation = async (req, res) => {
    try{
        const { location_id } = req.params;
        //Send GET request to Hapio API
        const response = await hapioClient.get(`locations/${location_id}`);
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
}
//create a location
const createLocation = async (req, res) =>{
    try{
        const {
            name,
            time_zone,
            resource_selection_strategy,
            enabled,
            postal_code,
            address,
            user_id
        } = req.body;

        const apiData = {
            name,
            time_zone,
            resource_selection_strategy,
            enabled,
        }

        const response = await hapioClient.post('locations', apiData);

        const { id: location_id } = response.data;

        connection.query('INSERT INTO locations (location_id, user_id, name, address, postal_code, timezone) VALUES (?, ?, ?, ?, ?, ?)',
            [location_id, user_id, name, address, postal_code, time_zone],
            (err, result) => {
                if(err){
                    console.log('Error inserting location into database:', err.message);
                    return res.status(500).json({ error: 'Database insertion failed' });
                }
                console.log('Location entry successfully inserted into database:', result);

                res.status(201).json({
                    message: 'Location successfully created',
                    location: {
                        location_id,
                        user_id,
                        name,
                        address,
                        postal_code,
                        time_zone,
                    },
                });
            }
        )

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
}
module.exports = {
    getLocations,
    createLocation,
    getSpecificLocation
}