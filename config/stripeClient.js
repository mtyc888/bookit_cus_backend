const dotenv = require('dotenv');
dotenv.config();

// Load the Stripe secret key from environment variables
const { STRIPE_SECRET_KEY } = process.env;

// Check if the secret key is defined
if (!STRIPE_SECRET_KEY) {
  throw new Error('Stripe Secret Key is not defined. Please check your .env file.');
}

// Initialize Stripe client with the secret key and API version
const stripe = require('stripe')(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16", // Ensures compatibility with this API version
});

// Export the initialized Stripe client for reuse
module.exports = stripe;
