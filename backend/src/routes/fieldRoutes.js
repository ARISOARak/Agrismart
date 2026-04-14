const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ajouter une parcelle
router.post('/', authMiddleware, fieldController.addField);

// Voir ses parcelles
router.get('/', authMiddleware, fieldController.getFields);

module.exports = router;