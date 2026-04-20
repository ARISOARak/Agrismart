import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        'http://192.168.1.248:3000/api/users/login',
        {
          email,
          password
        }
      );

      const token = response.data.token;

      // 🔐 sauvegarder token
      await AsyncStorage.setItem('token', token);

      console.log("TOKEN SAVED:", token);

      setMessage("Connexion réussie ✅");

      // 🔥 redirection
      setTimeout(() => {
        navigation.navigate('Home');
      }, 1000);

    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);

      if (error.response) {
        setMessage(error.response.data.message || "Erreur serveur");
      } else {
        setMessage("Problème de connexion au serveur");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion AgriSmart 🌾</Text>

      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Entrer votre email"
        style={styles.input}
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Entrer votre mot de passe"
        secureTextEntry
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5
  },
  message: {
    marginTop: 15,
    textAlign: 'center'
  }
});