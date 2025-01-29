const express = require('express');
const imageController = require('../controllers/imageController');
const router = express.Router();

router.get('/images', imageController.findAllByAnalito);

module.exports = router;
