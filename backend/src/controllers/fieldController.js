const fieldModel = require('../models/fieldModel');

const addField = async (req, res) => {
  try {
    const { name, surface_ha, culture_type, soil_type, status, latitude, longitude, color } = req.body;
    const user_id = req.user.id;

    if (!name || !surface_ha) {
      return res.status(400).json({ message: 'Nom et surface obligatoires' });
    }

    const newField = await fieldModel.createField({
      user_id,
      name,
      surface_ha: parseFloat(surface_ha),
      culture_type: culture_type || null,
      soil_type: soil_type || null,
      status: status === 'active' ? 'active' : 'inactive',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      color: color || '#2e7d32'
    });

    res.status(201).json({ field: newField });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getFields = async (req, res) => {
  try {
    const user_id = req.user.id;
    const fields = await fieldModel.getFieldsByUser(user_id);
    res.json({ fields });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surface_ha, culture_type, soil_type, status, latitude, longitude, color } = req.body;
    const user_id = req.user.id;

    const updated = await fieldModel.updateField(id, user_id, {
      name,
      surface_ha: surface_ha ? parseFloat(surface_ha) : undefined,
      culture_type,
      soil_type,
      status,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      color
    });

    if (!updated) {
      return res.status(404).json({ message: 'Parcelle non trouvée' });
    }
    res.json({ field: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteField = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const deleted = await fieldModel.deleteField(id, user_id);
    if (!deleted) {
      return res.status(404).json({ message: 'Parcelle non trouvée' });
    }
    res.json({ message: 'Parcelle supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addField, getFields, updateField, deleteField };