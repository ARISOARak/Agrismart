import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { predictService } from '../services/api';

// Thème identique à votre écran de connexion
const GREEN_DARK = '#2e7d32';
const GREEN_LIGHT = '#e8f5e9';

const HistoryScreen = ({ navigation }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await predictService.getHistory();
      const data = response.data.predictions || [];
      setPredictions(data);
    } catch (error) {
      console.log('Erreur historique');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  const renderItem = ({ item }) => {
    const date = formatDate(item.created_at);
    const rendement = parseFloat(item.rendement_prevu || 0).toFixed(1);
    const surface = parseFloat(item.surface_ha || 0).toFixed(1);
    const cultureType = item.culture_type || 'Riz';

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('Result', { prediction: item.rendement_prevu, formData: item })}
        activeOpacity={0.7}
      >
        <Text style={styles.date}>{date}</Text>
        
        <View style={styles.cultureContainer}>
          <Text style={styles.cultureName}>{cultureType}:</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="settings" size={20} color="#666" />
            <Text style={styles.surfaceText}>{surface} ha</Text>
          </View>
          <Text style={styles.rendementText}>{rendement} t/ha</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => navigation.navigate('Result', { prediction: item.rendement_prevu, formData: item })}
        >
          <Text style={styles.detailsText}>Voir détails</Text>
          <Ionicons name="arrow-forward" size={16} color={GREEN_DARK} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GREEN_DARK} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={GREEN_DARK} />
        </TouchableOpacity>
        <Text style={styles.title}>Historique</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Liste des prédictions */}
      {predictions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="file-document-outline" size={64} color="#ccc" />
          <Text style={styles.empty}>Aucune prédiction pour le moment</Text>
        </View>
      ) : (
        <FlatList 
          data={predictions} 
          keyExtractor={(item) => item.id.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Navbar avec icône Historique active */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="view-grid" size={26} color="#aaa" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('History')}>
          <MaterialCommunityIcons name="clock-outline" size={26} color={GREEN_DARK} />
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 5,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: GREEN_DARK,
  },
  placeholder: {
    width: 34,
  },
  list: { 
    padding: 20,
    paddingBottom: 20,
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  date: { 
    fontSize: 13, 
    color: '#adb5bd', 
    marginBottom: 12,
    fontWeight: '500',
  },
  cultureContainer: {
    marginBottom: 12,
  },
  cultureName: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: '#212529',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surfaceText: {
    fontSize: 15,
    color: '#495057',
    marginLeft: 8,
  },
  rendementText: {
    fontSize: 15,
    fontWeight: '600',
    color: GREEN_DARK,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  detailsText: {
    fontSize: 14,
    color: GREEN_DARK,
    marginRight: 8,
    fontWeight: '500',
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  empty: { 
    textAlign: 'center', 
    color: '#adb5bd', 
    fontSize: 16, 
    marginTop: 16,
  },
  // Bottom Navigation Bar
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
});

export default HistoryScreen;