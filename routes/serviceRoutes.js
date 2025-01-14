const express = require('express');
const router = express.Router();
const { createService, getAllService, assignResourceToService, getBookableSlots, removeService } = require('../controllers/serviceController');
const apiLimiter = require('../config/rateLimiter');

router.get('/services/:user_id', getAllService);
router.post('/services', createService);
router.put('/services/:serviceId/resources/:resourceId', assignResourceToService);
router.get('/services/:serviceId/bookable-slots', getBookableSlots, apiLimiter);
router.delete('/services/:service_id', removeService);
module.exports = router;
