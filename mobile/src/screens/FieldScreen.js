import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const FieldScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Mes Parcelles</Text>
      <Text style={styles.info}>Fonctionnalité à venir prochainement</Text>
      
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  info: { fontSize: 16, color: '#666', marginBottom: 30 },
  backBtn: { backgroundColor: '#2e7d32', padding: 12, borderRadius: 10 },
  backText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default FieldScreen;