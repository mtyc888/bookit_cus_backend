const express = require('express');
const router = express.Router();
const { getLocations, createLocation } = require('../controllers/locationController');

router.get('/locations', getLocations);
router.post('/locations', createLocation);

module.exports = router;