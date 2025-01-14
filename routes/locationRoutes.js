const express = require('express');
const router = express.Router();
const { getLocations, createLocation, getSpecificLocation, removeLocation } = require('../controllers/locationController');

router.get('/locations/:user_id', getLocations);
router.post('/locations', createLocation);
router.get('/locations/:location_id', getSpecificLocation);
router.delete('/locations/:location_id', removeLocation);
module.exports = router;