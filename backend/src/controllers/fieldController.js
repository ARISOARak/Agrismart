const fieldModel = require('../models/fieldModel');

const addField = async (req, res) => {
  const { surface, latitude, longitude, soil_type } = req.body;

  try {
    const user_id = req.user.id; // 🔥 récupéré du token

    const field = await fieldModel.createField(
      user_id,
      surface,
      latitude,
      longitude,
      soil_type
    );

    res.json(field);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getFields = async (req, res) => {
  try {
    const user_id = req.user.id;

    const fields = await fieldModel.getFieldsByUser(user_id);

    res.json(fields);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = { addField, getFields };