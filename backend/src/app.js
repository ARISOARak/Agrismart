require('dotenv').config();

const express = require('express');
const cors = require('cors');  // 👈 Ajout CORS
const app = express();
const userRoutes = require('./routes/userRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const cropDataRoutes = require('./routes/cropDataRoutes');
const aiRoutes = require('./routes/aiRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

// 👈 Configuration CORS (à ajouter avant les routes)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/crop-data', cropDataRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/predictions', predictionRoutes);

app.get('/', (req, res) => {
  res.send('AgriSmart API fonctionne 🚀');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});