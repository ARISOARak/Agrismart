import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

const PredictScreen = () => {
  const [surface, setSurface] = useState('');
  const [rainfall, setRainfall] = useState('');
  const [temperature, setTemperature] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    console.log("BOUTON CLIQUÉ");

    // 🔒 Validation
    if (!surface || !rainfall || !temperature) {
      setResult("⚠️ Remplir tous les champs");
      return;
    }

    if (
      isNaN(surface) ||
      isNaN(rainfall) ||
      isNaN(temperature)
    ) {
      setResult("⚠️ Entrer uniquement des nombres");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      console.log("ENVOI DATA:", surface, rainfall, temperature);

      const response = await axios.post(
        'http://192.168.1.248:8000/predict',
        {
          surface: parseFloat(surface),
          rainfall: parseFloat(rainfall),
          temperature: parseFloat(temperature)
        }
      );

      console.log("REPONSE API:", response.data);

      setResult("✅ Production estimée : " + response.data.prediction);

    } catch (error) {
      console.log("ERREUR:", error.message);

      setResult("❌ Erreur API (vérifie serveur ou IP)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Prédiction agricole</Text>

      <TextInput
        placeholder="Surface (ha)"
        value={surface}
        onChangeText={setSurface}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Pluie (mm)"
        value={rainfall}
        onChangeText={setRainfall}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Température (°C)"
        value={temperature}
        onChangeText={setTemperature}
        style={styles.input}
        keyboardType="numeric"
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Prédire" onPress={handlePredict} />
      )}

      {result ? <Text style={styles.result}>{result}</Text> : null}
    </View>
  );
};

export default PredictScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    marginBottom: 15,
    padding: 12,
    borderRadius: 8
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});