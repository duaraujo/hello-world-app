const express = require('express');
const downloadController = require('../controllers/downloadController');
const router = express.Router();

router.get('/download', downloadController.downloadDirectory);

module.exports = router;
