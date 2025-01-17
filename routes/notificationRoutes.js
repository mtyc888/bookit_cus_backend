const express = require('express');
const router = express.Router();
const { sendTemplateMessage, sendMail } = require('../controllers/notificationController');

// Define the POST route for sending template messages
router.post('/notifications/send-template-message', sendTemplateMessage);
router.post('/notifications/send-mail', sendMail)
module.exports = router;
