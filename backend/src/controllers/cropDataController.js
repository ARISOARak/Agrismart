const cropDataModel = require('../models/cropDataModel');

const addCropData = async (req, res) => {
  const {
    field_id,
    crop_id,
    sowing_date,
    harvest_date,
    rainfall,
    temperature,
    production
  } = req.body;

  try {
    const data = await cropDataModel.createCropData(
      field_id,
      crop_id,
      sowing_date,
      harvest_date,
      rainfall,
      temperature,
      production
    );

    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getCropData = async (req, res) => {
  const { field_id } = req.params;

  try {
    const data = await cropDataModel.getCropDataByField(field_id);
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = { addCropData, getCropData };