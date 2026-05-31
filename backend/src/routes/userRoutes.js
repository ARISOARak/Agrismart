const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Route protégée pour obtenir le profil depuis la base de données
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;