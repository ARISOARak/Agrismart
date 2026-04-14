const express = require('express');
const router = express.Router();
const cropDataController = require('../controllers/cropDataController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ajouter données agricoles
router.post('/', authMiddleware, cropDataController.addCropData);

// Voir données d’une parcelle
router.get('/:field_id', authMiddleware, cropDataController.getCropData);

module.exports = router;