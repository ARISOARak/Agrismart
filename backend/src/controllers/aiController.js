const axios = require('axios');

const predictProduction = async (req, res) => {
  const { surface, rainfall, temperature } = req.body;

  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/predict',
      {
        surface,
        rainfall,
        temperature
      }
    );

    res.json({
      prediction: response.data.prediction
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur IA');
  }
};

module.exports = { predictProduction };