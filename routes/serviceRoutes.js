const express = require('express');
const router = express.Router();
const { createService, getAllService, assignResourceToService, getBookableSlots, removeService } = require('../controllers/serviceController');

router.get('/services', getAllService);
router.post('/services', createService);
router.put('/services/:serviceId/resources/:resourceId', assignResourceToService);
router.get('/services/:serviceId/bookable-slots', getBookableSlots);
router.delete('/services/:service_id', removeService);
module.exports = router;
