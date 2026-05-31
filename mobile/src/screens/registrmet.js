import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { authService } from '../services/api';

// ─── Theme ────────────────────────────────────────────────────────────────────
const GREEN_DARK  = '#2e7d32';
const GREEN_LIGHT = '#e8f5e9';
const INPUT_BG    = '#f0f0f0';

const RegisterScreen = ({ navigation }) => {
  const [name, setName]                       = useState('');
  const [phone, setPhone]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const userEmail = `${phone}@agrismart.temp`;
      await authService.register(name, userEmail, password, 'agriculteur');
      Alert.alert('Succès', 'Compte créé avec succès', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert(
        'Erreur',
        error.response?.data?.message || "Erreur lors de l'inscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Blob vert haut gauche */}
      <View style={styles.blobTopLeft} />

      {/* Header : flèche retour + logo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="arrow-back" size={18} color="#555" />
          <Text style={styles.backText}>Connecter</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Text style={styles.logoAgri}>Agri</Text>
          <Text style={styles.logoSmart}>Smart</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Titre */}
        <Text style={styles.title}>Inscription</Text>

        {/* Nom d'utilisateur */}
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color="#aaa"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Téléphone */}
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons
            name="phone-outline"
            size={20}
            color="#aaa"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Telephone"
            placeholderTextColor="#aaa"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Mot de passe */}
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

        {/* Confirmer mot de passe */}
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color="#aaa"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmer"
            placeholderTextColor="#aaa"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirm(!showConfirm)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        {/* Bouton Inscrire */}
        {loading ? (
          <View style={styles.button}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Inscrire</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  /* Blob vert haut gauche */
  blobTopLeft: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: GREEN_LIGHT,
    opacity: 0.85,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
    fontWeight: '500',
  },
  logoContainer: {
    flexDirection: 'row',
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

  /* Scroll */
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },

  /* Titre */
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#888',
    textAlign: 'right',
    marginBottom: 30,
  },

  /* Champs */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    marginBottom: 16,
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
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 14,
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
});

export default RegisterScreen;
