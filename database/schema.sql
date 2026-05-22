CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50)
);

CREATE TABLE fields (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    surface FLOAT,
    latitude FLOAT,
    longitude FLOAT,
    soil_type VARCHAR(100)
);

CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE crop_data (
    id SERIAL PRIMARY KEY,
    field_id INT REFERENCES fields(id),
    crop_id INT REFERENCES crops(id),
    sowing_date DATE,
    harvest_date DATE,
    rainfall FLOAT,
    temperature FLOAT,
    production FLOAT
);

CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    field_id INT REFERENCES fields(id),
    predicted_yield FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- database/schema.sql (ajouter)
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    field_id INTEGER REFERENCES fields(id) ON DELETE SET NULL,
    
    -- Données d'entrée
    surface_ha DECIMAL(5,2) NOT NULL,
    culture_type VARCHAR(50) NOT NULL,
    pluie_mm DECIMAL(6,2),
    temperature_c DECIMAL(4,2),
    type_sol VARCHAR(30),
    date_semis DATE,
    
    -- Résultat IA
    rendement_prevu DECIMAL(8,2) NOT NULL,
    unite_rendement VARCHAR(20) DEFAULT 'kg/ha',
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_predictions_updated_at 
    BEFORE UPDATE ON predictions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();