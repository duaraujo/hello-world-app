const express = require('express');
const arquivoController = require('../controllers/arquivoController');
const router = express.Router();

router.get('/arquivos', arquivoController.findAllFiles);

module.exports = router;
