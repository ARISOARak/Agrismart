const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser(
      name,
      email,
      hashedPassword,
      role || 'agriculteur'
    );
    
    res.status(201).json({ 
      message: 'Utilisateur créé avec succès', 
      user 
    });
  } catch (error) {
    console.error("Erreur registerUser:", error);
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'votre_secret_key',
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Connexion réussie', 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Erreur loginUser:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ NOUVEAU : Récupérer le profil de l'utilisateur connecté
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // fourni par authMiddleware
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    // On renvoie les infos sans le mot de passe
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error("Erreur getProfile:", error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { registerUser, loginUser, getProfile };