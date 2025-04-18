const hapioClient = require('../config/hapioClient');
const connection = require('../connection');
//get locations
const getLocations = async (req, res) => {
    try {
        const { slug } = req.params;
        console.log('Received slug:', slug);
        // Simplified query using slug directly from locations table
        const query = `SELECT * FROM locations WHERE slug = ?`;

        connection.query(query, [slug], (err, result) => {
            if (err) {
                console.error("Error fetching locations from database:", err.message);
                return res.status(500).json({ error: "Failed to fetch locations" });
            }
            console.log('Query result:', result);
            console.log('SQL Query:', connection.format(query, [slug]));
            if (result.length === 0) {
                return res.status(404).json({ error: "No locations found for this business" });
            }
            console.log('Sending data:', { data: result });
            // Send the results as JSON to the frontend
            res.json({ data: result });
        });
    } catch (error) {
        console.error("Error fetching locations:", error.message);
        res.status(500).json({ error: "Failed to fetch locations" });
    }
};
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

        //get location_id from response.data
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
        console.error("Error creating location", error.message);
        //handle errors from Hapio API
        if(error.message){
            res.status(error.response.status).json(error.response.data);
        } 
        else {
            res.status(500).json({ error : 'Internal server error' });
        }
    }
}
//Delete a location
const removeLocation = async (req, res) =>{
    const { location_id } = req.params;
    try{
        const response = hapioClient.delete(`locations/${location_id}`);
        console.log("Hapio remove location successful");
        //remove the location from mysql
        connection.query('DELETE FROM locations WHERE location_id = ?',
            [location_id],
            (err, result) =>{
                if(err){
                    console.log("Error removing entry", err.message);

                    res.status(500).json({ message : "Error removing entry from MySQL" });
                }
                console.log("DELETE location successful", result);
                res.status(201).json({ message : "Location entry removal successful" });
            }
        )
    } catch(err){
        console.error("Error removing location", error.message);
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
    getSpecificLocation,
    removeLocation
}