import pandas as pd
import numpy as np

# nombre de données
n = 100

# génération aléatoire réaliste
data = {
    "surface": np.random.uniform(0.5, 3.0, n),
    "rainfall": np.random.uniform(80, 150, n),
    "temperature": np.random.uniform(20, 30, n),
}

df = pd.DataFrame(data)

# logique réaliste de production
df["production"] = (
    df["surface"] * 1.5 +
    df["rainfall"] * 0.02 -
    df["temperature"] * 0.1 +
    np.random.normal(0, 0.2, n)
)

# afficher
print(df.head())

# sauvegarder
df.to_csv("agri_dataset.csv", index=False)