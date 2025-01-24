const express = require('express');
const folderController = require('../controllers/folderController');
const router = express.Router();

router.get('/folders', folderController.findAllFolder);

module.exports = router;
