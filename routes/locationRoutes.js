const express = require('express');
const router = express.Router();
const { getLocations, createLocation, getSpecificLocation } = require('../controllers/locationController');

router.get('/locations', getLocations);
router.post('/locations', createLocation);
router.get('/locations/:location_id', getSpecificLocation);
module.exports = router;