import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Écran de connexion
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://192.168.1.248:3000/api/users/login',
        { email, password }
      );

      await AsyncStorage.setItem('token', response.data.token);
      Alert.alert('Succès', 'Connexion réussie !');
      onLogin();

    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion';
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌾 AgriSmart</Text>
      <Text style={styles.subtitle}>Connexion</Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" />
      ) : (
        <Button title="Se connecter" onPress={handleLogin} color="#2e7d32" />
      )}
    </View>
  );
};

// Écran d'accueil
const HomeScreen = ({ onLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌾 AgriSmart</Text>
      <Text style={styles.subtitle}>Bienvenue !</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="Déconnexion" onPress={onLogout} color="#d32f2f" />
      </View>
    </View>
  );
};

// Application principale
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.log('Erreur check token:', error);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (isLoggedIn) {
    return <HomeScreen onLogout={() => setIsLoggedIn(false)} />;
  }

  return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2e7d32',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default App;