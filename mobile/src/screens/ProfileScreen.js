import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }
      setUser({ 
        name: 'Jean Agriculteur', 
        email: 'jean@agrismart.com', 
        role: 'agriculteur',
        phone: '+261 XX XXX XX'
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
          },
          style: 'destructive'
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Profil</Text>
      
      <View style={styles.card}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>📧 {user?.email}</Text>
        <Text style={styles.phone}>📞 {user?.phone}</Text>
        <View style={styles.roleContainer}>
          <Text style={styles.role}>🌾 Rôle : {user?.role}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 3 },
  avatar: { fontSize: 60, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  email: { fontSize: 14, color: '#666', marginBottom: 5 },
  phone: { fontSize: 14, color: '#666', marginBottom: 10 },
  roleContainer: { backgroundColor: '#e8f5e9', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  role: { fontSize: 14, color: '#2e7d32', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#ff9800', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default ProfileScreen;