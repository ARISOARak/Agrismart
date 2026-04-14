from fastapi import FastAPI
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

app = FastAPI()

# 🔁 Charger et entraîner le modèle au démarrage
df = pd.read_csv("agri_dataset.csv")

X = df[["surface", "rainfall", "temperature"]]
y = df["production"]

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)


# 🧪 Route test
@app.get("/")
def read_root():
    return {"message": "API IA AgriSmart fonctionne 🚀"}


# 🧠 Route prédiction
@app.post("/predict")
def predict(data: dict):
    try:
        surface = data["surface"]
        rainfall = data["rainfall"]
        temperature = data["temperature"]

        input_data = pd.DataFrame(
            [[surface, rainfall, temperature]],
            columns=["surface", "rainfall", "temperature"]
        )

        prediction = model.predict(input_data)

        return {
            "prediction": float(prediction[0])
        }

    except Exception as e:
        return {"error": str(e)}