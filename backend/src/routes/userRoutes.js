const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

const authMiddleware = require('../middlewares/authMiddleware');

router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: "Accès autorisé",
    user: req.user
  });
});

router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: "Accès autorisé",
    user: req.user
  });
});

module.exports = router;