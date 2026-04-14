import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://192.168.1.249:3000/api/users/login',
        {
          email,
          password
        }
      );

     const token = response.data.token;

    // 🔐 sauvegarder token
    await AsyncStorage.setItem('token', token);

    setMessage("Connexion réussie");

    console.log("TOKEN SAVED:", token);

    } catch (error) {
      setMessage("Erreur de connexion");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Button title="Login" onPress={handleLogin} />

      <Text>{message}</Text>
    </View>
  );
};

export default LoginScreen;