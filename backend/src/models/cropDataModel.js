const pool = require('../config/db');

const createCropData = async (
  field_id,
  crop_id,
  sowing_date,
  harvest_date,
  rainfall,
  temperature,
  production
) => {
  const result = await pool.query(
    `INSERT INTO crop_data 
    (field_id, crop_id, sowing_date, harvest_date, rainfall, temperature, production)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`,
    [field_id, crop_id, sowing_date, harvest_date, rainfall, temperature, production]
  );
  return result.rows[0];
};

const getCropDataByField = async (field_id) => {
  const result = await pool.query(
    `SELECT * FROM crop_data WHERE field_id = $1`,
    [field_id]
  );
  return result.rows;
};

module.exports = { createCropData, getCropDataByField };