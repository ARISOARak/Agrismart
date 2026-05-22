import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { authService } from '../services/api';

// ─── Theme ────────────────────────────────────────────────────────────────────
const GREEN_DARK  = '#2e7d32';
const GREEN_LIGHT = '#e8f5e9';
const INPUT_BG    = '#f0f0f0';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      await AsyncStorage.setItem('token', response.data.token);
      Alert.alert('Succès', 'Connexion réussie');
      navigation.replace('Home');
    } catch (error) {
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Identifiants incorrects'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Blob vert décoratif en haut à droite */}
      <View style={styles.blobTopRight} />

      {/* Logo AgriSmart */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoAgri}>Agri</Text>
        <Text style={styles.logoSmart}>Smart</Text>
      </View>

      {/* Formulaire */}
      <View style={styles.content}>
        <Text style={styles.title}>Connexion</Text>

        {/* Champ Email */}
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="#aaa"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
        </View>

        {/* Champ Mot de passe */}
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color="#aaa"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        {/* Bouton Connecter */}
        {loading ? (
          <View style={styles.button}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Connecter</Text>
          </TouchableOpacity>
        )}

        {/* Mot de passe oublié */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Mot de passe oublié?</Text>
        </TouchableOpacity>
      </View>

      {/* Lien S'inscrire en bas à droite */}
      <TouchableOpacity
        style={styles.registerContainer}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>S'inscrire</Text>
        <Ionicons
          name="arrow-forward"
          size={16}
          color={GREEN_DARK}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  /* Blob vert haut droite */
  blobTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: GREEN_LIGHT,
    opacity: 0.8,
  },

  /* Logo */
  logoContainer: {
    flexDirection: 'row',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 28,
  },
  logoAgri: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2e7d32',
    letterSpacing: 0.3,
  },
  logoSmart: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8bc34a',
    letterSpacing: 0.3,
  },

  /* Zone formulaire */
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    marginTop: -60,
  },

  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#888',
    marginBottom: 24,
  },

  /* Champs */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 10,
  },

  /* Bouton */
  button: {
    backgroundColor: GREEN_DARK,
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    shadowColor: GREEN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  /* Mot de passe oublié */
  forgotText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },

  /* S'inscrire */
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  registerText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
});

export default LoginScreen;
