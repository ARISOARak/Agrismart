const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Accès refusé, aucun token fourni' });
  }

  const token = authHeader.split(' ')[1]; // retire "Bearer "
  if (!token) {
    return res.status(401).json({ message: 'Format token invalide' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'votre_secret_key';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = authMiddleware;