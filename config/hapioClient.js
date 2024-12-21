const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
// Load environment credentials
const { HAPIO_API_TOKEN, HAPIO_BASE_URL } = process.env;

// Create an Axios instance for the Hapio API
const hapioClient = axios.create({
    baseURL: HAPIO_BASE_URL || 'https://eu-central-1.hapio.net/v1/', // Use the base URL from the environment or a default
    headers: {
        Authorization: `Bearer ${HAPIO_API_TOKEN}`, // Use the token from the environment
        'Content-Type': 'application/json',
    },
});

module.exports = hapioClient;
