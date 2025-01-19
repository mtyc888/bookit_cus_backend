const express = require('express');
const router = express.Router();
const { 
    getResource, 
    getResourceScheduleBlocks, 
    createRecurringScheduleForResource, 
    createScheduleBlockForRecurringSchdule,
    getScheduleForResource,
    createResource,
    removeResource
} = require('../controllers/resourceController');

router.get('/resources/:slug', getResource);
router.get('/resources/:resourceId/schedule-blocks', getResourceScheduleBlocks);
router.post('/resources/:resourceId/recurring-schedules', createRecurringScheduleForResource);
router.post('/resources/:resourceId/recurring-schedules/:recurringScheduleId/schedule-blocks', createScheduleBlockForRecurringSchdule);
router.get('/resources/:resourceId/schedule', getScheduleForResource);
router.post('/resources/:resourceId');
router.post('/resources', createResource);
router.delete('/resources/:resourceId', removeResource);

module.exports = router;