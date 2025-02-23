// authRouter.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Adjust path as needed

// Login route
router.post('/login', authController.login);

module.exports = router;