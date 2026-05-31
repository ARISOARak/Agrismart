const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes protégées
router.post('/', authMiddleware, fieldController.addField);       // Ajouter
router.get('/', authMiddleware, fieldController.getFields);       // Lister
router.put('/:id', authMiddleware, fieldController.updateField);  // Modifier
router.delete('/:id', authMiddleware, fieldController.deleteField); // Supprimer

module.exports = router;