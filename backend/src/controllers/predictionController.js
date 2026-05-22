const PredictionModel = require('../models/predictionModel');

const PredictionController = {
    savePrediction: async (req, res) => {
        try {
            const userId = req.user.id;
            const {
                field_id, surface_ha, culture_type,
                pluie_mm, temperature_c, type_sol, date_semis,
                rendement_prevu, unite_rendement
            } = req.body;
            
            if (!surface_ha || !culture_type || !rendement_prevu) {
                return res.status(400).json({ 
                    message: "Champs requis: surface_ha, culture_type, rendement_prevu" 
                });
            }
            
            const savedPrediction = await PredictionModel.create({
                user_id: userId,
                field_id: field_id || null,
                surface_ha,
                culture_type,
                pluie_mm: pluie_mm || null,
                temperature_c: temperature_c || null,
                type_sol: type_sol || null,
                date_semis: date_semis || null,
                rendement_prevu,
                unite_rendement: unite_rendement || 'kg/ha'
            });
            
            res.status(201).json({
                success: true,
                message: "Prédiction sauvegardée",
                prediction: savedPrediction
            });
        } catch (error) {
            console.error("Erreur savePrediction:", error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    },
    
    getHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const limit = req.query.limit || 50;
            const predictions = await PredictionModel.getByUserId(userId, limit);
            res.json({ success: true, count: predictions.length, predictions });
        } catch (error) {
            console.error("Erreur getHistory:", error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    },
    
    getPredictionById: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const prediction = await PredictionModel.getById(id, userId);
            if (!prediction) {
                return res.status(404).json({ message: "Prédiction non trouvée" });
            }
            res.json({ success: true, prediction });
        } catch (error) {
            console.error("Erreur getPredictionById:", error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
};

module.exports = PredictionController;