const express = require('express');
const router = express.Router();

const PredictionController = require('../controllers/predictionController');
const authMiddleware = require('../middlewares/authMiddleware');


// ✅ Route publique pour dashboard
router.get('/', (req, res) => {
  res.json([
    {
      surface: 1.5,
      rainfall: 120,
      temperature: 25,
      result: 2.1
    },
    {
      surface: 2.0,
      rainfall: 100,
      temperature: 24,
      result: 3.4
    },
    {
      surface: 0.8,
      rainfall: 140,
      temperature: 26,
      result: 1.9
    }
  ]);
});


// 🔐 Routes protégées
router.use(authMiddleware);

router.post('/save', PredictionController.savePrediction);
router.get('/history', PredictionController.getHistory);
router.get('/:id', PredictionController.getPredictionById);

module.exports = router;