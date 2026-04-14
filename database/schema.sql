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