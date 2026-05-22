import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { predictService } from '../services/api';

// ─── Theme ────────────────────────────────────────────────────────────────────
const GREEN_DARK  = '#2e7d32';
const GREEN_LIGHT = '#e8f5e9';
const INPUT_BG    = '#f0f0f0';

const HomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({ total: 0, avgYield: 0, lastDate: '-' });

  useEffect(() => {
    loadStats();
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  const loadStats = async () => {
    try {
      const response = await predictService.getHistory();
      const predictions = response.data.predictions || [];
      const total = predictions.length;
      const sum = predictions.reduce((s, p) => s + (parseFloat(p.rendement_prevu) || 0), 0);
      const avgYield = total > 0 ? (sum / total).toFixed(1) : 0;
      const lastDate = predictions.length > 0
        ? new Date(predictions[0].created_at).toLocaleDateString('fr-FR')
        : '-';
      setStats({ total, avgYield, lastDate });
    } catch (error) {
      console.log('Erreur chargement stats');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoAgri}>Agri</Text>
          <Text style={styles.logoSmart}>Smart</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={22} color="#888" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Carte statistique label */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="layers-outline" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Carte statistique</Text>
        </View>

        {/* Stats cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Prédiction</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.avgYield}</Text>
            <Text style={styles.statLabel}>Rendement</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.lastDate}</Text>
            <Text style={styles.statLabel}>Dernière analyse</Text>
          </View>
        </View>

        
      </ScrollView>

      {/* Bottom nav bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <MaterialCommunityIcons name="view-grid" size={26} color={GREEN_DARK} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('History')}>
          <MaterialCommunityIcons name="clock-outline" size={26} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Predict')}>
          <MaterialCommunityIcons name="brain" size={26} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Fields')}>
          <Ionicons name="location-outline" size={26} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <MaterialCommunityIcons name="account-outline" size={26} color="#aaa" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  logoContainer: {
    flexDirection: 'row',
  },
  logoAgri: {
    fontSize: 22,
    fontWeight: '700',
    color: GREEN_DARK,
    letterSpacing: 0.3,
  },
  logoSmart: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8bc34a',   // vert clair / jaune-vert comme dans l'image
    letterSpacing: 0.3,
  },
  logoutBtn: {
    padding: 6,
  },

  /* Section header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },

  /* Stats */
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#ececec',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '31%',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#777',
    textAlign: 'center',
  },

  /* Menu */
  menuContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: GREEN_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },

  /* Bottom nav */
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: GREEN_LIGHT,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
