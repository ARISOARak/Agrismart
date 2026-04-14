import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error

# 1. Charger les données
df = pd.read_csv("agri_dataset.csv")

print("Aperçu des données :")
print(df.head())

# 2. Définir X (entrées) et y (sortie)
X = df[["surface", "rainfall", "temperature"]]
y = df["production"]

# 3. Séparer train / test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 4. Créer le modèle
model = RandomForestRegressor(n_estimators=100, random_state=42)

# 5. Entraîner
model.fit(X_train, y_train)

# 6. Prédictions
y_pred = model.predict(X_test)

# 7. Évaluation
mae = mean_absolute_error(y_test, y_pred)

print("\nErreur moyenne (MAE):", mae)

# 8. Test manuel
test_data = pd.DataFrame([[1.5, 120, 25]], columns=["surface", "rainfall", "temperature"])
prediction = model.predict(test_data)

print("\nPrédiction pour [1.5 ha, 120 mm, 25°C] :")
print(prediction[0])