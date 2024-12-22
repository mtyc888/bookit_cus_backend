const express = require('express');
const router = express.Router();
const { sendTemplateMessage } = require('../controllers/notificationController');

// Define the POST route for sending template messages
router.post('/send-template-message', sendTemplateMessage);

module.exports = router;
