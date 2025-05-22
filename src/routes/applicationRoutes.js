const express = require('express');
const router = express.Router();
const applicationController = require('../controller/applicationController')

// Get all applications
// This path should be accessible at the root of the applicationRoutes
router.get('/all-applications', applicationController.getAllApplications);

module.exports = router;
