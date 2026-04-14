const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

// route prédiction sécurisée
router.post('/predict', authMiddleware, aiController.predictProduction);

module.exports = router;