const express = require('express');
const router = express.Router();
const { createService, getAllService, deleteService, assignResourceToService, getBookableSlots } = require('../controllers/serviceController');

router.get('/services', getAllService);
router.post('/services', createService);
router.delete('/services/:serviceId', deleteService);
router.put('/services/:serviceId/resources/:resourceId', assignResourceToService);
router.get('/services/:serviceId/bookable-slots', getBookableSlots);
module.exports = router;
