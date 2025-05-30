const express = require('express');
const router = express.Router();
const proxyPathController = require('../controller/proxyController');

/**
 * @route POST /proxy
 * @desc Add a new proxy path for the application
 */
router.post('/', proxyPathController.addProxyPath);

/**
 * @route DELETE /proxy/:application_id
 * @desc Remove a proxy path by application ID
 */
router.delete('/:application_id', proxyPathController.removeProxyPath);

module.exports = router;
