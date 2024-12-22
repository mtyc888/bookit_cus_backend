const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Load environment credentials
const { WHATSAPP_API_TOKEN } = process.env;

// Create an Axios instance to send requests to the WhatsApp API
const whatsAppClient = axios.create({
    baseURL: "https://graph.facebook.com/v21.0", // Base URL for the API
    headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`, // Use the token from your environment
        'Content-Type': 'application/json'
    }
});

module.exports = whatsAppClient;
