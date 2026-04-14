require('dotenv').config();

const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const cropDataRoutes = require('./routes/cropDataRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/crop-data', cropDataRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('AgriSmart API fonctionne 🚀');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});