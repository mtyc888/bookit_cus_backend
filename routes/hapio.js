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

module.exports = router;