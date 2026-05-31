const db = require('../config/db'); // adaptez votre connexion

const createField = async (data) => {
  const { user_id, name, surface_ha, culture_type, soil_type, status, latitude, longitude, color } = data;
  const query = `
    INSERT INTO fields (user_id, name, surface_ha, culture_type, soil_type, status, latitude, longitude, color, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *
  `;
  const values = [user_id, name, surface_ha, culture_type, soil_type, status, latitude, longitude, color];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getFieldsByUser = async (user_id) => {
  const query = `
    SELECT id, name, surface_ha, culture_type, soil_type, status, latitude, longitude, color, created_at, updated_at
    FROM fields
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const result = await db.query(query, [user_id]);
  return result.rows;
};

const updateField = async (id, user_id, data) => {
  const fields = [];
  const values = [];
  let i = 1;

  if (data.name !== undefined) { fields.push(`name = $${i++}`); values.push(data.name); }
  if (data.surface_ha !== undefined) { fields.push(`surface_ha = $${i++}`); values.push(data.surface_ha); }
  if (data.culture_type !== undefined) { fields.push(`culture_type = $${i++}`); values.push(data.culture_type); }
  if (data.soil_type !== undefined) { fields.push(`soil_type = $${i++}`); values.push(data.soil_type); }
  if (data.status !== undefined) { fields.push(`status = $${i++}`); values.push(data.status); }
  if (data.latitude !== undefined) { fields.push(`latitude = $${i++}`); values.push(data.latitude); }
  if (data.longitude !== undefined) { fields.push(`longitude = $${i++}`); values.push(data.longitude); }
  if (data.color !== undefined) { fields.push(`color = $${i++}`); values.push(data.color); }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  values.push(id, user_id);
  const query = `UPDATE fields SET ${fields.join(', ')} WHERE id = $${i++} AND user_id = $${i++} RETURNING *`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteField = async (id, user_id) => {
  // Supprimer d'abord les dépendances (crop_data)
  await db.query('DELETE FROM crop_data WHERE field_id = $1', [id]);
  const query = 'DELETE FROM fields WHERE id = $1 AND user_id = $2 RETURNING id';
  const result = await db.query(query, [id, user_id]);
  return result.rows.length > 0;
};

module.exports = { createField, getFieldsByUser, updateField, deleteField };