const hapioClient = require('../config/hapioClient');

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

//create a location
const createLocation = async (req, res) =>{
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
}
module.exports = {
    getLocations,
    createLocation
}