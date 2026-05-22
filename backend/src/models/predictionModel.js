const db = require('../config/db');

const PredictionModel = {
    // Créer une prédiction sauvegardée
    create: async (predictionData) => {
        const { 
            user_id, field_id, surface_ha, culture_type, 
            pluie_mm, temperature_c, type_sol, date_semis,
            rendement_prevu, unite_rendement 
        } = predictionData;
        
        const query = `
            INSERT INTO predictions (
                user_id, field_id, surface_ha, culture_type,
                pluie_mm, temperature_c, type_sol, date_semis,
                rendement_prevu, unite_rendement
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        
        const values = [
            user_id, field_id, surface_ha, culture_type,
            pluie_mm, temperature_c, type_sol, date_semis,
            rendement_prevu, unite_rendement
        ];
        
        const result = await db.query(query, values);
        return result.rows[0];
    },
    
    // Récupérer toutes les prédictions d'un utilisateur
    getByUserId: async (userId, limit = 50) => {
        const query = `
            SELECT * FROM predictions 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `;
        const result = await db.query(query, [userId, limit]);
        return result.rows;
    },
    
    // Récupérer une prédiction par ID
    getById: async (id, userId) => {
        const query = `
            SELECT * FROM predictions 
            WHERE id = $1 AND user_id = $2
        `;
        const result = await db.query(query, [id, userId]);
        return result.rows[0];
    }
};

module.exports = PredictionModel;