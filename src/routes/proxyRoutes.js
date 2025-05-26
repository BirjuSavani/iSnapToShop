const express = require('express');
const router = express.Router();
const proxyPathController = require('../controller/proxyController');

// Add a new proxy path
router.post('/', proxyPathController.addProxyPath);

// Delete a proxy path
router.delete('/:application_id', proxyPathController.removeProxyPath);

module.exports = router;
