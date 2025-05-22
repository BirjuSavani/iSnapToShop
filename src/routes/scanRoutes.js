const express = require('express');
const router = express.Router();
const scanController = require('../controller/scanController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/init-index', scanController.initProductIndexing);

router.post('/index-product/:productId', scanController.indexSingleProduct);

router.post('/search-by-image', upload.single('image'), scanController.searchByImage);

router.get('/system-status', scanController.checkSystemStatus);

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Scan API is working!' });
});

module.exports = router;
