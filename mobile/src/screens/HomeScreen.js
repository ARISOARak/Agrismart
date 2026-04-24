import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgriSmart 🌾</Text>

      <Button
        title="🌾 Mes Parcelles"
        onPress={() => navigation.navigate('Field')}
      />

      <Button
        title="🧠 Prédiction"
        onPress={() => navigation.navigate('Predict')}
      />

      <Button
        title="📊 Résultats"
        onPress={() => navigation.navigate('Result')}
      />

      <Button
        title="⚙️ Profil"
        onPress={() => navigation.navigate('Profile')}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20
  }
});