import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar, Modal, Animated, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { predictService } from '../services/api';

// ─── Theme ────────────────────────────────────────────────────────────────────
const GREEN_DARK  = '#2e7d32';
const GREEN_LIGHT = '#e8f5e9';
const INPUT_BG    = '#f0f0f0';

// ─── Formulaire modal ─────────────────────────────────────────────────────────
const PredictForm = ({ visible, onClose, onSubmit, loading, editingPrediction, setEditingPrediction }) => {
  const [form, setForm] = useState({
    culture: '', typeSol: '', surface: '', pluie: '', temperature: ''
  });

  // Réinitialiser ou charger les données d'édition
  useEffect(() => {
    if (editingPrediction) {
      setForm({
        culture: editingPrediction.culture || '',
        typeSol: editingPrediction.typeSol || '',
        surface: editingPrediction.surface?.toString() || '',
        pluie: editingPrediction.pluie?.toString() || '',
        temperature: editingPrediction.temperature?.toString() || ''
      });
    } else {
      setForm({ culture: '', typeSol: '', surface: '', pluie: '', temperature: '' });
    }
  }, [editingPrediction, visible]);

  const fields = [
    { key: 'culture',     label: 'Culture',      placeholder: 'Culture', icon: 'sprout',              keyboard: 'default'  },
    { key: 'typeSol',     label: 'Type du sol',  placeholder: 'Type du sol', icon: 'shovel',              keyboard: 'default'  },
    { key: 'surface',     label: 'Surface (ha)',  placeholder: 'Surface (ha)',               icon: 'resize',              keyboard: 'numeric'  },
    { key: 'pluie',       label: 'Pluie (mm)',    placeholder: 'Pluie (mm)',                   icon: 'weather-rainy',       keyboard: 'numeric'  },
    { key: 'temperature', label: 'Température (°C)',  placeholder: 'Température (°C)',               icon: 'thermometer',         keyboard: 'numeric'  },
  ];

  const handleSubmit = () => {
    const { culture, surface, pluie, temperature } = form;
    if (!culture || !surface || !pluie || !temperature) {
      Alert.alert('Erreur', 'Veuillez remplir Culture, Surface, Pluie et Température');
      return;
    }
    if (parseFloat(surface) <= 0 || parseFloat(pluie) < 0 || parseFloat(temperature) < -50) {
      Alert.alert('Erreur', 'Veuillez entrer des valeurs valides (surface > 0, pluie ≥ 0, température ≥ -50°C)');
      return;
    }
    onSubmit(form);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalWrapper}
        >
          <View style={styles.modalCard}>
            {/* Close */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#888" />
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.modalTitleRow}>
              <MaterialCommunityIcons name="brain" size={26} color={GREEN_DARK} />
              <Text style={styles.modalTitle}>
                {editingPrediction ? 'Modifier la prédiction' : 'Nouvelle prédiction'}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {fields.map((f) => (
                <View key={f.key} style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name={f.icon}
                    size={25}
                    color="#aaa"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor="#aaa"
                    keyboardType={f.keyboard}
                    value={form[f.key]}
                    onChangeText={(t) => setForm({ ...form, [f.key]: t })}
                    autoCapitalize="none"
                  />
                </View>
              ))}

              {loading ? (
                <View style={styles.button}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
                  <Text style={styles.buttonText}>
                    {editingPrediction ? 'Mettre à jour' : 'Prédire'}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ─── Carte de prédiction ──────────────────────────────────────────────────────
const PredictionCard = ({ item, onEdit, onDelete, onRefresh }) => {
  const [showActions, setShowActions] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleLongPress = () => {
    setShowActions(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseActions = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowActions(false));
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="sprout" size={18} color="#e6c84a" />
            <Text style={styles.cardCulture}>Culture {item.culture}</Text>
          </View>
          <View style={styles.cardDetail}>
            <Text style={styles.cardDetailLabel}>• Type du sol :</Text>
            <Text style={styles.cardDetailValue}>{item.typeSol}</Text>
          </View>
          <View style={styles.cardDetail}>
            <Text style={styles.cardDetailLabel}>• Surfaces :</Text>
            <Text style={styles.cardDetailValue}>{item.surface} ha</Text>
          </View>
          <View style={styles.cardDetail}>
            <Text style={styles.cardDetailLabel}>• Pluie :</Text>
            <Text style={styles.cardDetailValue}>{item.pluie} mm</Text>
          </View>
          <View style={styles.cardDetail}>
            <Text style={styles.cardDetailLabel}>• Temperature:</Text>
            <Text style={styles.cardDetailValue}>{item.temperature} °C</Text>
          </View>
          {item.created_at && (
            <View style={styles.cardDetail}>
              <Text style={styles.cardDetailLabel}>• Date :</Text>
              <Text style={styles.cardDetailValue}>
                {new Date(item.created_at).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardRight}>
          <View style={styles.cardImageBox}>
            <MaterialCommunityIcons name="image-outline" size={36} color="#ccc" />
          </View>
          <View style={styles.rendementRow}>
            <Text style={styles.rendementLabel}>• Rendement estimé</Text>
          </View>
          <View style={styles.rendementValueRow}>
            <MaterialCommunityIcons name="check-circle" size={18} color={GREEN_DARK} />
            <Text style={styles.rendementValue}>{item.rendement} t/ha</Text>
          </View>
        </View>

        {/* Actions overlay */}
        {showActions && (
          <Animated.View style={[styles.actionsOverlay, { opacity: fadeAnim }]}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.editBtn]} 
              onPress={() => {
                handleCloseActions();
                onEdit(item);
              }}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
              <Text style={styles.actionText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.deleteBtn]} 
              onPress={() => {
                handleCloseActions();
                Alert.alert(
                  'Confirmation',
                  'Voulez-vous vraiment supprimer cette prédiction ?',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(item.id) }
                  ]
                );
              }}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#fff" />
              <Text style={styles.actionText}>Supprimer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={handleCloseActions}>
              <MaterialCommunityIcons name="close" size={20} color="#fff" />
              <Text style={styles.actionText}>Annuler</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Screen principal ─────────────────────────────────────────────────────────
const PredictScreen = ({ navigation }) => {
  const [predictions, setPredictions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPrediction, setEditingPrediction] = useState(null);

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    try {
      const response = await predictService.getHistory();
      const data = response.data.predictions || [];
      if (data.length > 0) {
        const formattedData = data.map(p => ({
          id: p.id,
          culture: p.culture_type || 'Riz',
          typeSol: p.type_sol || 'non spécifié',
          surface: p.surface_ha,
          pluie: p.pluie_mm,
          temperature: p.temperature_c,
          rendement: typeof p.rendement_prevu === 'number' ? p.rendement_prevu.toFixed(1) : p.rendement_prevu,
          created_at: p.created_at
        }));
        setPredictions(formattedData);
      }
    } catch (_) {
      console.log('Erreur chargement historique');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleSubmit = async (form) => {
    setLoading(true);
    try {
      // 1. D'abord, faire la prédiction
      const res = await predictService.predict({
        surface: parseFloat(form.surface),
        rainfall: parseFloat(form.pluie),
        temperature: parseFloat(form.temperature),
      });
      const rendement = res.data.prediction;

      // 2. Vérifier le token avant de sauvegarder
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        // Si pas de token, afficher seulement le résultat sans sauvegarder
        Alert.alert(
          '✅ Prédiction réussie',
          `Rendement estimé : ${typeof rendement === 'number' ? rendement.toFixed(1) : rendement} t/ha\n\nCulture: ${form.culture}\nSurface: ${form.surface} ha\nPluie: ${form.pluie} mm\nTempérature: ${form.temperature}°C`,
          [{ text: 'OK' }]
        );
        
        // Ajouter localement
        const newPrediction = {
          id: Date.now(),
          culture: form.culture,
          typeSol: form.typeSol || 'non spécifié',
          surface: form.surface,
          pluie: form.pluie,
          temperature: form.temperature,
          rendement: typeof rendement === 'number' ? rendement.toFixed(1) : rendement,
          created_at: new Date().toISOString()
        };
        setPredictions((prev) => [newPrediction, ...prev]);
        setShowForm(false);
        return;
      }

      // 3. Si token existe, essayer de sauvegarder
      try {
        const saveResponse = await predictService.savePrediction({
          surface_ha: parseFloat(form.surface),
          culture_type: form.culture,
          pluie_mm: parseFloat(form.pluie),
          temperature_c: parseFloat(form.temperature),
          type_sol: form.typeSol || 'non spécifié',
          date_semis: new Date().toISOString().split('T')[0],
          rendement_prevu: rendement,
          unite_rendement: 'tonnes/ha',
        });
        
        const savedPrediction = saveResponse.data.prediction;
        const newPrediction = {
          id: savedPrediction?.id || Date.now(),
          culture: form.culture,
          typeSol: form.typeSol || 'non spécifié',
          surface: form.surface,
          pluie: form.pluie,
          temperature: form.temperature,
          rendement: typeof rendement === 'number' ? rendement.toFixed(1) : rendement,
          created_at: new Date().toISOString()
        };
        
        setPredictions((prev) => [newPrediction, ...prev]);
        setShowForm(false);
        
        Alert.alert(
          '✅ Prédiction réussie',
          `Rendement estimé : ${newPrediction.rendement} t/ha\n\nCulture: ${form.culture}\nSurface: ${form.surface} ha`,
          [{ text: 'OK' }]
        );
      } catch (saveError) {
        // Si erreur 403, sauvegarder localement seulement
        console.log('Erreur sauvegarde API:', saveError.response?.status);
        
        const newPrediction = {
          id: Date.now(),
          culture: form.culture,
          typeSol: form.typeSol || 'non spécifié',
          surface: form.surface,
          pluie: form.pluie,
          temperature: form.temperature,
          rendement: typeof rendement === 'number' ? rendement.toFixed(1) : rendement,
          created_at: new Date().toISOString()
        };
        
        setPredictions((prev) => [newPrediction, ...prev]);
        setShowForm(false);
        
        Alert.alert(
          '✅ Prédiction réussie',
          `${newPrediction.rendement} t/ha\n\n⚠️ Non sauvegardé sur le serveur (problème d'authentification)`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur de prédiction');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (prediction) => {
    setEditingPrediction(prediction);
    setShowForm(true);
  };

  const handleUpdate = async (form) => {
    setLoading(true);
    try {
      const res = await predictService.predict({
        surface: parseFloat(form.surface),
        rainfall: parseFloat(form.pluie),
        temperature: parseFloat(form.temperature),
      });
      const rendement = res.data.prediction;

      const token = await AsyncStorage.getItem('token');
      if (token && editingPrediction.id) {
        try {
          await predictService.updatePrediction(editingPrediction.id, {
            surface_ha: parseFloat(form.surface),
            culture_type: form.culture,
            pluie_mm: parseFloat(form.pluie),
            temperature_c: parseFloat(form.temperature),
            type_sol: form.typeSol || 'non spécifié',
            rendement_prevu: rendement,
          });
        } catch (updateError) {
          console.log('Erreur mise à jour API:', updateError.response?.status);
        }
      }

      setPredictions(prev => prev.map(p => 
        p.id === editingPrediction.id 
          ? {
              ...p,
              culture: form.culture,
              typeSol: form.typeSol || 'non spécifié',
              surface: form.surface,
              pluie: form.pluie,
              temperature: form.temperature,
              rendement: typeof rendement === 'number' ? rendement.toFixed(1) : rendement,
            }
          : p
      ));
      
      setShowForm(false);
      setEditingPrediction(null);
      Alert.alert('Succès', 'Prédiction mise à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur de mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          await predictService.deletePrediction(id);
        } catch (deleteError) {
          console.log('Erreur suppression API:', deleteError.response?.status);
        }
      }
      setPredictions(prev => prev.filter(p => p.id !== id));
      Alert.alert('Succès', 'Prédiction supprimée avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer la prédiction');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoAgri}>Agri</Text>
          <Text style={styles.logoSmart}>Smart</Text>
        </View>
      </View>

      {/* Section title + bouton + */}
      <View style={styles.sectionRow}>
        <View style={styles.sectionTitleWrapper}>
          <MaterialCommunityIcons name="brain" size={20} color="#333" />
          <Text style={styles.sectionTitle}>
            Prédictions effectuées ({predictions.length})
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingPrediction(null);
            setShowForm(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={32} color={GREEN_DARK} />
        </TouchableOpacity>
      </View>

      {/* Liste des prédictions */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN_DARK]} />
        }
      >
        {predictions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="brain-off" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Aucune prédiction pour le moment</Text>
            <Text style={styles.emptyStateSubText}>Appuyez sur le bouton + pour commencer</Text>
          </View>
        ) : (
          predictions.map((item) => (
            <PredictionCard 
              key={item.id} 
              item={item} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={onRefresh}
            />
          ))
        )}
        {predictions.length > 0 && predictions.length < 3 && (
          <>
            <View style={styles.emptyCard} />
            <View style={styles.emptyCard} />
          </>
        )}
      </ScrollView>

      {/* Formulaire modal */}
      <PredictForm
        visible={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPrediction(null);
        }}
        onSubmit={editingPrediction ? handleUpdate : handleSubmit}
        loading={loading}
        editingPrediction={editingPrediction}
        setEditingPrediction={setEditingPrediction}
      />

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="view-grid" size={26} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('History')}>
          <MaterialCommunityIcons name="clock-outline" size={26} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <MaterialCommunityIcons name="brain" size={26} color={GREEN_DARK} />
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

// Styles (garder vos styles existants)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 14,
  },
  logoContainer: { flexDirection: 'row' },
  logoAgri:  { fontSize: 22, fontWeight: '700', color: '#2e7d32', letterSpacing: 0.3 },
  logoSmart: { fontSize: 22, fontWeight: '700', color: '#8bc34a', letterSpacing: 0.3 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitleWrapper: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginLeft: 8 },
  addBtn: { padding: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    position: 'relative',
  },
  cardLeft: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardCulture: { fontSize: 15, fontWeight: '700', color: '#222', marginLeft: 6 },
  cardDetail: { flexDirection: 'row', marginBottom: 3 },
  cardDetailLabel: { fontSize: 12, fontWeight: '600', color: '#555', width: 100 },
  cardDetailValue: { fontSize: 12, color: '#888' },
  cardRight: { width: 110, alignItems: 'flex-end' },
  cardImageBox: {
    width: 90, height: 70, borderRadius: 10,
    backgroundColor: '#e8e8e8', justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  rendementRow: { width: '100%' },
  rendementLabel: { fontSize: 10, color: '#888', marginBottom: 4 },
  rendementValueRow: { flexDirection: 'row', alignItems: 'center' },
  rendementValue: { fontSize: 16, fontWeight: '700', color: '#222', marginLeft: 4 },
  emptyCard: { backgroundColor: '#ececec', borderRadius: 16, height: 100 },
  actionsOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  actionBtn: { alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, minWidth: 80 },
  editBtn: { backgroundColor: '#2196F3' },
  deleteBtn: { backgroundColor: '#f44336' },
  cancelBtn: { backgroundColor: '#555' },
  actionText: { color: '#fff', fontSize: 12, marginTop: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 16, color: '#999', marginTop: 16 },
  emptyStateSubText: { fontSize: 14, color: '#bbb', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  modalWrapper: { justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 8, padding: 4 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginLeft: 10 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 10 },
  button: {
    backgroundColor: GREEN_DARK,
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: GREEN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.4 },
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
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default PredictScreen;