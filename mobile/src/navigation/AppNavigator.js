import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import PredictScreen from '../screens/PredictScreen';

// 🔹 Écrans temporaires propres (pas null)
import { View, Text } from 'react-native';

const Placeholder = ({ title }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title} (en cours...)</Text>
  </View>
);

const FieldScreen = () => <Placeholder title="Mes Parcelles" />;
const ResultScreen = () => <Placeholder title="Résultats" />;
const ProfileScreen = () => <Placeholder title="Profil" />;

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2e7d32',
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      {/* 🔐 Auth */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      {/* 🏠 Home */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />

      {/* 🧠 Prédiction (IMPORTANT) */}
      <Stack.Screen
        name="Predict"
        component={PredictScreen}
        options={{ title: 'Prédiction IA' }}
      />

      {/* 🌾 Parcelles */}
      <Stack.Screen
        name="Field"
        component={FieldScreen}
        options={{ title: 'Mes Parcelles' }}
      />

      {/* 📊 Résultats */}
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ title: 'Résultats' }}
      />

      {/* ⚙️ Profil */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;