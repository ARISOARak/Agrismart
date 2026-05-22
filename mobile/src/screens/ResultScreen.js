import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const ResultScreen = ({ route, navigation }) => {
  const { prediction, formData } = route.params || {};

  if (!prediction) {
    return (
      <View style={styles.container}>
        <Text>Aucune prédiction disponible</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Prédiction effectuée</Text>

      <View style={styles.card}>
        <Text style={styles.culture}>{formData?.culture || 'Culture'}</Text>
        <Text style={styles.detail}>Type de sol : {formData?.typeSol || 'Non spécifié'}</Text>
        <Text style={styles.detail}>Surface : {formData?.surface} ha</Text>
        <Text style={styles.detail}>Pluie : {formData?.pluie} mm</Text>
        <Text style={styles.detail}>Température : {formData?.temperature} °C</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Rendement estimé</Text>
          <Text style={styles.resultValue}>{prediction} t/ha</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Predict')}>
          <Text style={styles.buttonText}>🔄 Nouvelle prédiction</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('History')}>
          <Text style={styles.buttonText}>📊 Voir historique</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 3 },
  culture: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  detail: { fontSize: 16, color: '#666', marginBottom: 5 },
  resultBox: { marginTop: 15, padding: 15, backgroundColor: '#e8f5e9', borderRadius: 10, alignItems: 'center' },
  resultLabel: { fontSize: 14, color: '#2e7d32' },
  resultValue: { fontSize: 32, fontWeight: 'bold', color: '#2e7d32', marginTop: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  buttonPrimary: { flex: 1, backgroundColor: '#2e7d32', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonSecondary: { flex: 1, backgroundColor: '#ff9800', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 14, fontWeight: 'bold' }
});

export default ResultScreen;