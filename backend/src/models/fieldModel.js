const pool = require('../config/db');

const createField = async (user_id, surface, latitude, longitude, soil_type) => {
  const result = await pool.query(
    `INSERT INTO fields (user_id, surface, latitude, longitude, soil_type)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user_id, surface, latitude, longitude, soil_type]
  );
  return result.rows[0];
};

const getFieldsByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT * FROM fields WHERE user_id = $1`,
    [user_id]
  );
  return result.rows;
};

module.exports = { createField, getFieldsByUser };