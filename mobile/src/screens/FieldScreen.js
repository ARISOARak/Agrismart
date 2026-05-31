import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform, Modal, TextInput,
  ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_W } = Dimensions.get('window');
const GREEN_DARK  = '#2e7d32';
const GREEN_LIGHT = '#e8f5e9';
const INPUT_BG    = '#f0f0f0';
const FIELD_COLORS = ['#2e7d32', '#1565c0', '#6a1b9a', '#e65100', '#00838f', '#c62828'];
const API_BASE_URL = 'http://192.168.1.248:3000/api'; // À ajuster si besoin

const generateDefaultPolygon = (center, delta = 0.003) => [
  { latitude: center.latitude - delta, longitude: center.longitude - delta },
  { latitude: center.latitude - delta, longitude: center.longitude + delta },
  { latitude: center.latitude + delta, longitude: center.longitude + delta },
  { latitude: center.latitude + delta, longitude: center.longitude - delta },
];

// ─── Formulaire ─────────────────────────────────────────────────────────────
const FieldForm = ({ visible, onClose, onSave, editData }) => {
  const isEdit = !!editData;
  const [form, setForm] = useState({ nom: '', surface: '', culture: '', sol: '', statut: 'Actif' });
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(GREEN_DARK);

  useEffect(() => {
    if (editData) {
      setForm({
        nom:     editData.nom     || '',
        surface: editData.surface || '',
        culture: editData.culture || '',
        sol:     editData.sol     || '',
        statut:  editData.statut  || 'Actif',
      });
      setSelectedColor(editData.color || GREEN_DARK);
    } else {
      setForm({ nom: '', surface: '', culture: '', sol: '', statut: 'Actif' });
      setSelectedColor(GREEN_DARK);
    }
  }, [editData, visible]);

  const fields = [
    { key: 'nom',     label: 'Nom de la parcelle', icon: 'map-marker-outline', keyboard: 'default' },
    { key: 'surface', label: 'Surface (ha)',        icon: 'resize',             keyboard: 'numeric' },
    { key: 'culture', label: 'Culture',             icon: 'sprout',             keyboard: 'default' },
    { key: 'sol',     label: 'Type de sol',         icon: 'shovel',             keyboard: 'default' },
  ];

  const handleSave = () => {
    if (!form.nom || !form.surface) {
      Alert.alert('Erreur', 'Nom et surface sont obligatoires');
      return;
    }
    setLoading(true);
    onSave({ ...form, color: selectedColor }, editData?.id);
    setLoading(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={styles.modalIconBox}>
                <MaterialCommunityIcons name={isEdit ? 'pencil' : 'map-plus'} size={20} color={GREEN_DARK} />
              </View>
              <Text style={styles.modalTitle}>{isEdit ? 'Modifier la parcelle' : 'Nouvelle parcelle'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#888" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {fields.map((f) => (
              <View key={f.key}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconBox}>
                    <MaterialCommunityIcons name={f.icon} size={18} color={GREEN_DARK} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={f.label}
                    placeholderTextColor="#bbb"
                    keyboardType={f.keyboard}
                    value={form[f.key]}
                    onChangeText={(t) => setForm({ ...form, [f.key]: t })}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}
            <Text style={styles.fieldLabel}>Statut</Text>
            <View style={styles.statusToggleRow}>
              {['Actif', 'En repos'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusToggleBtn, form.statut === s && styles.statusToggleBtnActive]}
                  onPress={() => setForm({ ...form, statut: s })}
                >
                  <MaterialCommunityIcons name={s === 'Actif' ? 'check-circle-outline' : 'pause-circle-outline'} size={16} color={form.statut === s ? '#fff' : '#888'} />
                  <Text style={[styles.statusToggleText, form.statut === s && styles.statusToggleTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Couleur de la parcelle</Text>
            <View style={styles.colorRow}>
              {FIELD_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotSelected]}
                  onPress={() => setSelectedColor(c)}
                >
                  {selectedColor === c && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
            {loading ? (
              <View style={styles.button}><ActivityIndicator size="small" color="#fff" /></View>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleSave} activeOpacity={0.85}>
                <MaterialCommunityIcons name={isEdit ? 'check' : 'plus'} size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.buttonText}>{isEdit ? 'Enregistrer' : 'Ajouter la parcelle'}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Détail parcelle ────────────────────────────────────────────────────────
const FieldDetail = ({ field, onClose, onEdit, onDelete }) => {
  if (!field) return null;
  const infos = [
    { icon: 'sprout', label: 'Culture', value: field.culture || '—' },
    { icon: 'resize', label: 'Surface', value: `${field.surface || '0'} ha` },
    { icon: 'shovel', label: 'Type de sol', value: field.sol || '—' },
    { icon: 'check-circle-outline', label: 'Statut', value: field.statut || 'Actif', valueColor: (field.statut === 'Actif') ? GREEN_DARK : '#f9a825' },
  ];
  return (
    <View style={styles.detailSheet}>
      <View style={styles.detailHandle} />
      <View style={styles.detailHeader}>
        <View style={[styles.detailColorDot, { backgroundColor: field.color || GREEN_DARK }]} />
        <Text style={styles.detailName}>{field.nom}</Text>
        <TouchableOpacity style={styles.detailActionBtn} onPress={() => onEdit(field)}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color={GREEN_DARK} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.detailActionBtn, { backgroundColor: '#ffebee', marginLeft: 6 }]} onPress={() => onDelete(field)}>
          <MaterialCommunityIcons name="delete-outline" size={18} color="#e53935" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginLeft: 6 }}>
          <Ionicons name="close-circle" size={22} color="#ccc" />
        </TouchableOpacity>
      </View>
      <View style={styles.detailGrid}>
        {infos.map((info) => (
          <View key={info.label} style={styles.detailItem}>
            <View style={styles.detailItemIcon}>
              <MaterialCommunityIcons name={info.icon} size={16} color={GREEN_DARK} />
            </View>
            <View>
              <Text style={styles.detailItemLabel}>{info.label}</Text>
              <Text style={[styles.detailItemValue, info.valueColor && { color: info.valueColor }]}>{info.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Carte parcelle avec indicateurs ────────────────────────────────────────
const FieldCard = ({ item, onPress, onEdit, onDelete, selected }) => {
  const getSoilHealth = (sol) => {
    switch(sol) {
      case 'Argileux': return 'Bon';
      case 'Limoneux': return 'Moyen';
      default: return 'Correct';
    }
  };
  const showAlert = item.statut === 'En repos';
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      <View style={[styles.cardColorBar, { backgroundColor: item.color || GREEN_DARK }]} />
      <View style={[styles.cardIconBox, { backgroundColor: (item.color || GREEN_DARK) + '1A' }]}>
        <MaterialCommunityIcons name="map-outline" size={22} color={item.color || GREEN_DARK} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.nom}</Text>
        <View style={styles.cardMetaRow}>
          <MaterialCommunityIcons name="sprout" size={12} color="#aaa" />
          <Text style={styles.cardMeta}>{item.culture || '—'}</Text>
          <MaterialCommunityIcons name="resize" size={12} color="#aaa" style={{ marginLeft: 6 }} />
          <Text style={styles.cardMeta}>{item.surface || '0'} ha</Text>
          <MaterialCommunityIcons name="shovel" size={12} color="#aaa" style={{ marginLeft: 6 }} />
          <Text style={styles.cardMeta}>{item.sol || '—'}</Text>
        </View>
        <View style={styles.indicatorsRow}>
          <View style={[styles.indicator, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.indicatorText}>🌱 {getSoilHealth(item.sol)}</Text>
          </View>
          <View style={[styles.indicator, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.indicatorText}>💧 Irrig.</Text>
          </View>
          {showAlert && (
            <View style={[styles.indicator, { backgroundColor: '#ffebee' }]}>
              <Text style={[styles.indicatorText, { color: '#e53935' }]}>⚠️ Alerte</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cardRight}>
        <View style={[styles.statusBadge, item.statut === 'Actif' ? styles.statusActive : styles.statusRest]}>
          <View style={[styles.statusDot, { backgroundColor: item.statut === 'Actif' ? GREEN_DARK : '#f9a825' }]} />
          <Text style={[styles.statusText, item.statut === 'Actif' ? styles.statusTextActive : styles.statusTextRest]}>
            {item.statut || 'Actif'}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.cardActionBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={15} color={GREEN_DARK} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item)} style={[styles.cardActionBtn, styles.cardActionBtnDanger]}>
            <MaterialCommunityIcons name="delete-outline" size={15} color="#e53935" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Appels API directs ─────────────────────────────────────────────────────
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Non authentifié');
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, message: errorData.message || `Erreur ${response.status}` };
  }
  return response.json();
};

// ─── Écran principal ────────────────────────────────────────────────────────
const FieldScreen = ({ navigation }) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedField, setSelected] = useState(null);
  const [mapMode, setMapMode] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  const loadFields = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) { setFields([]); setLoading(false); return; }
      const data = await apiCall('/fields');
      const fieldsData = data.fields || data;
      console.log('📦 Champs reçus:', fieldsData);
      const formatted = fieldsData.map((f, idx) => {
        let surfaceNum = 0;
        if (f.surface_ha !== undefined && f.surface_ha !== null) surfaceNum = parseFloat(f.surface_ha);
        else if (f.surface !== undefined && f.surface !== null) surfaceNum = parseFloat(f.surface);
        let surfaceStr = isNaN(surfaceNum) ? '0' : surfaceNum.toString();
        let cultureValue = f.culture_type || f.culture || 'Non spécifiée';
        let solValue = f.soil_type || f.sol || 'Non spécifié';
        let isActive = (f.status === 'active' || f.statut === 'Actif');
        let statut = isActive ? 'Actif' : 'En repos';
        let lat = parseFloat(f.latitude ?? f.lat ?? -18.910);
        let lng = parseFloat(f.longitude ?? f.lng ?? 47.536);
        let coordinate = { latitude: lat, longitude: lng };
        return {
          id: f.id,
          nom: f.name || f.nom || `Parcelle ${f.id}`,
          surface: surfaceStr,
          culture: cultureValue,
          sol: solValue,
          statut: statut,
          color: f.color || FIELD_COLORS[idx % FIELD_COLORS.length],
          coordinate,
          polygon: (f.polygon?.length > 0) ? f.polygon : generateDefaultPolygon(coordinate),
        };
      });
      setFields(formatted);
    } catch (error) {
      console.error('Erreur chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les parcelles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadFields(); }, []);

  const handleSave = async (formData, existingId) => {
    try {
      let latitude = -18.910 + Math.random() * 0.02;
      let longitude = 47.536 + Math.random() * 0.02;
      if (existingId) {
        const existing = fields.find(f => f.id === existingId);
        if (existing) {
          latitude = existing.coordinate.latitude;
          longitude = existing.coordinate.longitude;
        }
      }
      const payload = {
        name: formData.nom,
        surface_ha: parseFloat(formData.surface),
        culture_type: formData.culture,
        soil_type: formData.sol,
        status: formData.statut === 'Actif' ? 'active' : 'inactive',
        latitude: latitude,
        longitude: longitude,
      };
      console.log('📤 Payload envoyé:', payload);
      if (existingId) {
        await apiCall(`/fields/${existingId}`, 'PUT', payload);
        Alert.alert('Succès', 'Parcelle modifiée');
      } else {
        await apiCall('/fields', 'POST', payload);
        Alert.alert('Succès', 'Parcelle ajoutée');
      }
      await loadFields();
      setShowForm(false);
      setEditData(null);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Alert.alert('Erreur', error.message || 'Opération impossible');
    }
  };

  const handleDelete = async (field) => {
    Alert.alert('Supprimer', `Supprimer "${field.nom}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await apiCall(`/fields/${field.id}`, 'DELETE');
            if (selectedField?.id === field.id) setSelected(null);
            await loadFields();
            Alert.alert('Supprimé', 'Parcelle supprimée');
          } catch (error) {
            console.error('Erreur suppression:', error);
            Alert.alert('Erreur', error.message || 'Impossible de supprimer');
          }
        },
      },
    ]);
  };

  const openEdit = (field) => {
    setEditData(field);
    setShowForm(true);
    setSelected(null);
  };
  const openAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const focusField = (field) => {
    setSelected(field);
    if (mapMode && mapReady && mapRef.current) {
      mapRef.current.animateToRegion({
        ...field.coordinate, latitudeDelta: 0.02, longitudeDelta: 0.02,
      }, 600);
    }
  };

  const totalHa = fields.reduce((sum, f) => sum + (parseFloat(f.surface) || 0), 0).toFixed(1);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GREEN_DARK} />
        <Text style={{ marginTop: 12, color: '#888' }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoAgri}>Agri</Text>
          <Text style={styles.logoSmart}>Smart</Text>
        </View>
        <View style={styles.toggleRow}>
          <TouchableOpacity style={[styles.toggleBtn, !mapMode && styles.toggleBtnActive]} onPress={() => setMapMode(false)}>
            <MaterialCommunityIcons name="view-list" size={18} color={!mapMode ? '#fff' : '#888'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, mapMode && styles.toggleBtnActive]} onPress={() => { setMapMode(true); setMapReady(false); }}>
            <MaterialCommunityIcons name="map" size={18} color={mapMode ? '#fff' : '#888'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <View style={styles.sectionTitleWrapper}>
          <MaterialCommunityIcons name="map-outline" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Mes Parcelles</Text>
        </View>
        <TouchableOpacity onPress={openAdd} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={32} color={GREEN_DARK} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {[
          { icon: 'map-outline', value: fields.length, label: 'Parcelles'  },
          { icon: 'resize',      value: totalHa,        label: 'Total (ha)' },
          { icon: 'sprout',      value: fields.filter(f => f.statut === 'Actif').length, label: 'Actives' },
        ].map((s) => (
          <View key={s.label} style={styles.statChip}>
            <MaterialCommunityIcons name={s.icon} size={16} color={GREEN_DARK} />
            <Text style={styles.statChipValue}>{s.value}</Text>
            <Text style={styles.statChipLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {fields.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="map-search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Aucune parcelle</Text>
          <Text style={styles.emptySubtitle}>Appuyez sur + pour ajouter</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={openAdd}>
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.emptyBtnText}>Ajouter une parcelle</Text>
          </TouchableOpacity>
        </View>
      )}

      {!mapMode && fields.length > 0 && (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFields(); }} colors={[GREEN_DARK]} />}
        >
          {fields.map((item) => (
            <FieldCard
              key={item.id}
              item={item}
              selected={selectedField?.id === item.id}
              onPress={focusField}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>
      )}

      {mapMode && (
        <View style={styles.mapContainer}>
          {!mapReady && (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color={GREEN_DARK} />
              <Text style={styles.mapLoadingText}>Chargement de la carte...</Text>
            </View>
          )}
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{ latitude: -18.915, longitude: 47.540, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
            onMapReady={() => setMapReady(true)}
            onPress={() => setSelected(null)}
          >
            {fields.map((field) => (
              <React.Fragment key={field.id}>
                {field.polygon?.length > 0 && (
                  <Polygon
                    coordinates={field.polygon}
                    fillColor={(field.color || GREEN_DARK) + '33'}
                    strokeColor={field.color || GREEN_DARK}
                    strokeWidth={2}
                  />
                )}
                <Marker coordinate={field.coordinate} onPress={() => focusField(field)}>
                  <View style={[styles.markerBox, { borderColor: field.color || GREEN_DARK }, selectedField?.id === field.id && styles.markerBoxSelected]}>
                    <MaterialCommunityIcons name="map-marker" size={18} color={field.color || GREEN_DARK} />
                    <Text style={[styles.markerLabel, { color: field.color || GREEN_DARK }]}>{field.nom}</Text>
                  </View>
                </Marker>
              </React.Fragment>
            ))}
          </MapView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mapCardsList} style={styles.mapCardsScroll}>
            {fields.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.mapCard, selectedField?.id === item.id && styles.mapCardSelected]} onPress={() => focusField(item)}>
                <View style={[styles.mapCardIconBox, { backgroundColor: (item.color || GREEN_DARK) + '1A' }]}>
                  <MaterialCommunityIcons name="map-outline" size={18} color={item.color || GREEN_DARK} />
                </View>
                <View>
                  <Text style={styles.mapCardName}>{item.nom}</Text>
                  <Text style={styles.mapCardMeta}>{item.surface || '0'} ha</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {selectedField && (
            <FieldDetail field={selectedField} onClose={() => setSelected(null)} onEdit={openEdit} onDelete={handleDelete} />
          )}
        </View>
      )}

      <FieldForm visible={showForm} onClose={() => { setShowForm(false); setEditData(null); }} onSave={handleSave} editData={editData} />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="view-grid" size={26} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('History')}>
          <MaterialCommunityIcons name="clock-outline" size={26} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Predict')}>
          <MaterialCommunityIcons name="brain" size={26} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Ionicons name="location" size={26} color={GREEN_DARK} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <MaterialCommunityIcons name="account-outline" size={26} color="#aaa" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles (identique à la version précédente, trop long à recopier mais vous les avez déjà)
// Assurez-vous de conserver les styles existants (ils sont complets)
const styles = StyleSheet.create({
  // ... tous les styles que vous aviez déjà (je les laisse ici pour gagner de la place, mais mettez les vôtres)
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#f0f0f0', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoContainer: { flexDirection: 'row' },
  logoAgri: { fontSize: 22, fontWeight: '700', color: GREEN_DARK },
  logoSmart: { fontSize: 22, fontWeight: '700', color: '#8bc34a' },
  toggleRow: { flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  toggleBtnActive: { backgroundColor: GREEN_DARK, borderRadius: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitleWrapper: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginLeft: 8 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  statChip: { flex: 1, backgroundColor: '#ececec', borderRadius: 12, paddingVertical: 10, alignItems: 'center', gap: 2 },
  statChipValue: { fontSize: 18, fontWeight: '700', color: '#333' },
  statChipLabel: { fontSize: 11, color: '#888' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#555', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 8 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: GREEN_DARK, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, marginTop: 24 },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', elevation: 1, overflow: 'hidden' },
  cardSelected: { borderWidth: 1.5, borderColor: GREEN_DARK },
  cardColorBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  cardIconBox: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginLeft: 8 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 4 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 3 },
  cardMeta: { fontSize: 11, color: '#555' },
  indicatorsRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  indicator: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  indicatorText: { fontSize: 10, fontWeight: '600', color: '#444' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardActions: { flexDirection: 'row', gap: 6 },
  cardActionBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: GREEN_LIGHT, justifyContent: 'center', alignItems: 'center' },
  cardActionBtnDanger: { backgroundColor: '#ffebee' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusActive: { backgroundColor: '#e8f5e9' },
  statusRest: { backgroundColor: '#fff8e1' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  statusTextActive: { color: GREEN_DARK },
  statusTextRest: { color: '#f9a825' },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  mapLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  mapLoadingText: { marginTop: 10, color: '#666' },
  markerBox: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4, elevation: 3 },
  markerBoxSelected: { backgroundColor: GREEN_LIGHT },
  markerLabel: { fontSize: 11, fontWeight: '700' },
  mapCardsScroll: { position: 'absolute', bottom: 10, left: 0, right: 0 },
  mapCardsList: { paddingHorizontal: 12, gap: 10 },
  mapCard: { backgroundColor: '#fff', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 3, minWidth: 150 },
  mapCardSelected: { borderWidth: 1.5, borderColor: GREEN_DARK },
  mapCardIconBox: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  mapCardName: { fontSize: 13, fontWeight: '700', color: '#222' },
  mapCardMeta: { fontSize: 11, color: '#888' },
  detailSheet: { position: 'absolute', bottom: 90, left: 12, right: 12, backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 8 },
  detailHandle: { width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  detailColorDot: { width: 12, height: 12, borderRadius: 6 },
  detailName: { flex: 1, fontSize: 16, fontWeight: '700', color: '#222' },
  detailActionBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: GREEN_LIGHT, justifyContent: 'center', alignItems: 'center' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%' },
  detailItemIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: GREEN_LIGHT, justifyContent: 'center', alignItems: 'center' },
  detailItemLabel: { fontSize: 11, color: '#aaa' },
  detailItemValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: GREEN_LIGHT, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  closeBtn: { padding: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 6, marginTop: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: INPUT_BG, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 2, marginBottom: 8 },
  inputIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: GREEN_LIGHT, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 10 },
  statusToggleRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  statusToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f0f0f0' },
  statusToggleBtnActive: { backgroundColor: GREEN_DARK },
  statusToggleText: { fontSize: 13, fontWeight: '600', color: '#888' },
  statusToggleTextActive: { color: '#fff' },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  colorDot: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  colorDotSelected: { borderWidth: 3, borderColor: '#fff', elevation: 4 },
  button: { backgroundColor: GREEN_DARK, borderRadius: 12, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 3 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  bottomNav: { flexDirection: 'row', backgroundColor: GREEN_LIGHT, paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 8 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default FieldScreen;