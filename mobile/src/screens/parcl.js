import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform, Modal, TextInput,
  ActivityIndicator, Alert, Dimensions
} from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Theme ──────────────────────────────────────────────────────────────────
const GREEN_DARK  = '#2e7d32';
const GREEN_LIGHT = '#e8f5e9';
const INPUT_BG    = '#f0f0f0';

// ─── Données démo avec coordonnées GPS (Madagascar) ─────────────────────────
const MOCK_FIELDS = [
  {
    id: 1,
    nom: 'Parcelle Nord',
    surface: '2.5',
    culture: 'Riz',
    sol: 'Argileux',
    statut: 'Actif',
    color: '#2e7d32',
    coordinate: { latitude: -18.910, longitude: 47.536 },
    polygon: [
      { latitude: -18.908, longitude: 47.534 },
      { latitude: -18.908, longitude: 47.538 },
      { latitude: -18.912, longitude: 47.538 },
      { latitude: -18.912, longitude: 47.534 },
    ],
  },
  {
    id: 2,
    nom: 'Parcelle Sud',
    surface: '1.8',
    culture: 'Maïs',
    sol: 'Sableux',
    statut: 'En repos',
    color: '#f9a825',
    coordinate: { latitude: -18.925, longitude: 47.530 },
    polygon: [
      { latitude: -18.923, longitude: 47.528 },
      { latitude: -18.923, longitude: 47.532 },
      { latitude: -18.927, longitude: 47.532 },
      { latitude: -18.927, longitude: 47.528 },
    ],
  },
  {
    id: 3,
    nom: 'Parcelle Est',
    surface: '3.2',
    culture: 'Manioc',
    sol: 'Limoneux',
    statut: 'Actif',
    color: '#1565c0',
    coordinate: { latitude: -18.915, longitude: 47.550 },
    polygon: [
      { latitude: -18.913, longitude: 47.548 },
      { latitude: -18.913, longitude: 47.553 },
      { latitude: -18.918, longitude: 47.553 },
      { latitude: -18.918, longitude: 47.548 },
    ],
  },
];

// ─── Formulaire ajout parcelle ───────────────────────────────────────────────
const FieldForm = ({ visible, onClose, onSave }) => {
  const [form, setForm] = useState({ nom: '', surface: '', culture: '', sol: '' });
  const [loading, setLoading] = useState(false);

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
    setTimeout(() => {
      onSave({
        ...form,
        id: Date.now(),
        statut: 'Actif',
        color: GREEN_DARK,
        coordinate: { latitude: -18.910 + Math.random() * 0.02, longitude: 47.536 + Math.random() * 0.02 },
        polygon: [],
      });
      setForm({ nom: '', surface: '', culture: '', sol: '' });
      setLoading(false);
      onClose();
    }, 600);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#888" />
          </TouchableOpacity>
          <View style={styles.modalTitleRow}>
            <MaterialCommunityIcons name="map-plus" size={24} color={GREEN_DARK} />
            <Text style={styles.modalTitle}>Nouvelle parcelle</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {fields.map((f) => (
              <View key={f.key} style={styles.inputWrapper}>
                <MaterialCommunityIcons name={f.icon} size={20} color="#aaa" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={f.label}
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
              <TouchableOpacity style={styles.button} onPress={handleSave} activeOpacity={0.85}>
                <Text style={styles.buttonText}>Enregistrer</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Détail parcelle (bottom sheet) ─────────────────────────────────────────
const FieldDetail = ({ field, onClose }) => {
  if (!field) return null;
  return (
    <View style={styles.detailSheet}>
      <View style={styles.detailHandle} />
      <View style={styles.detailHeader}>
        <View style={[styles.detailColorDot, { backgroundColor: field.color }]} />
        <Text style={styles.detailName}>{field.nom}</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={22} color="#ccc" />
        </TouchableOpacity>
      </View>
      <View style={styles.detailGrid}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="sprout" size={18} color={GREEN_DARK} />
          <View style={styles.detailItemText}>
            <Text style={styles.detailItemLabel}>Culture</Text>
            <Text style={styles.detailItemValue}>{field.culture || '—'}</Text>
          </View>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="resize" size={18} color={GREEN_DARK} />
          <View style={styles.detailItemText}>
            <Text style={styles.detailItemLabel}>Surface</Text>
            <Text style={styles.detailItemValue}>{field.surface} ha</Text>
          </View>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="shovel" size={18} color={GREEN_DARK} />
          <View style={styles.detailItemText}>
            <Text style={styles.detailItemLabel}>Type de sol</Text>
            <Text style={styles.detailItemValue}>{field.sol || '—'}</Text>
          </View>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="check-circle-outline" size={18} color={GREEN_DARK} />
          <View style={styles.detailItemText}>
            <Text style={styles.detailItemLabel}>Statut</Text>
            <Text style={[
              styles.detailItemValue,
              { color: field.statut === 'Actif' ? GREEN_DARK : '#f9a825' }
            ]}>
              {field.statut}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ─── Carte mini parcelle ─────────────────────────────────────────────────────
const FieldCard = ({ item, onPress, selected }) => (
  <TouchableOpacity
    style={[styles.card, selected && styles.cardSelected]}
    onPress={() => onPress(item)}
    activeOpacity={0.85}
  >
    <View style={[styles.cardColorBar, { backgroundColor: item.color }]} />
    <View style={styles.cardIconBox}>
      <MaterialCommunityIcons name="map-outline" size={24} color={item.color} />
    </View>
    <View style={styles.cardBody}>
      <Text style={styles.cardName}>{item.nom}</Text>
      <Text style={styles.cardMeta}>{item.culture || '—'}  ·  {item.surface} ha</Text>
    </View>
    <View style={[
      styles.statusBadge,
      item.statut === 'Actif' ? styles.statusActive : styles.statusRest
    ]}>
      <Text style={[
        styles.statusText,
        item.statut === 'Actif' ? styles.statusTextActive : styles.statusTextRest
      ]}>
        {item.statut}
      </Text>
    </View>
  </TouchableOpacity>
);

// ─── Screen principal ────────────────────────────────────────────────────────
const FieldScreen = ({ navigation }) => {
  const [fields, setFields]           = useState(MOCK_FIELDS);
  const [showForm, setShowForm]       = useState(false);
  const [selectedField, setSelected] = useState(null);
  const [mapMode, setMapMode]         = useState(false);  // false = liste, true = carte
  const mapRef = useRef(null);

  const handleSave = (newField) => {
    setFields((prev) => [newField, ...prev]);
  };

  const focusField = (field) => {
    setSelected(field);
    if (mapMode && mapRef.current && field.coordinate) {
      mapRef.current.animateToRegion({
        ...field.coordinate,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 600);
    }
  };

  const totalHa = fields.reduce((s, f) => s + parseFloat(f.surface || 0), 0).toFixed(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoAgri}>Agri</Text>
          <Text style={styles.logoSmart}>Smart</Text>
        </View>
        {/* Toggle liste / carte */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !mapMode && styles.toggleBtnActive]}
            onPress={() => setMapMode(false)}
          >
            <MaterialCommunityIcons
              name="view-list"
              size={18}
              color={!mapMode ? '#fff' : '#888'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mapMode && styles.toggleBtnActive]}
            onPress={() => setMapMode(true)}
          >
            <MaterialCommunityIcons
              name="map"
              size={18}
              color={mapMode ? '#fff' : '#888'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Section title */}
      <View style={styles.sectionRow}>
        <View style={styles.sectionTitleWrapper}>
          <MaterialCommunityIcons name="map-outline" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Mes Parcelles</Text>
        </View>
        <TouchableOpacity onPress={() => setShowForm(true)} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={32} color={GREEN_DARK} />
        </TouchableOpacity>
      </View>

      {/* Stats chips */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statChipValue}>{fields.length}</Text>
          <Text style={styles.statChipLabel}>Parcelles</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipValue}>{totalHa}</Text>
          <Text style={styles.statChipLabel}>Total (ha)</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipValue}>
            {fields.filter((f) => f.statut === 'Actif').length}
          </Text>
          <Text style={styles.statChipLabel}>Actives</Text>
        </View>
      </View>

      {/* Vue LISTE */}
      {!mapMode && (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {fields.map((item) => (
            <FieldCard
              key={item.id}
              item={item}
              selected={selectedField?.id === item.id}
              onPress={focusField}
            />
          ))}
        </ScrollView>
      )}

      {/* Vue CARTE */}
      {mapMode && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: -18.915,
              longitude: 47.540,
              latitudeDelta: 0.06,
              longitudeDelta: 0.06,
            }}
            onPress={() => setSelected(null)}
          >
            {fields.map((field) => (
              <React.Fragment key={field.id}>
                {/* Polygone de la parcelle */}
                {field.polygon.length > 0 && (
                  <Polygon
                    coordinates={field.polygon}
                    fillColor={field.color + '44'}
                    strokeColor={field.color}
                    strokeWidth={2}
                  />
                )}
                {/* Marqueur personnalisé */}
                <Marker
                  coordinate={field.coordinate}
                  onPress={() => focusField(field)}
                >
                  <View style={[
                    styles.markerBox,
                    selectedField?.id === field.id && styles.markerBoxSelected,
                    { borderColor: field.color }
                  ]}>
                    <MaterialCommunityIcons name="map-marker" size={20} color={field.color} />
                    <Text style={[styles.markerLabel, { color: field.color }]}>{field.nom}</Text>
                  </View>
                </Marker>
              </React.Fragment>
            ))}
          </MapView>

          {/* Mini liste scrollable sous la carte */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mapCardsList}
            style={styles.mapCardsScroll}
          >
            {fields.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.mapCard,
                  selectedField?.id === item.id && styles.mapCardSelected,
                ]}
                onPress={() => focusField(item)}
                activeOpacity={0.85}
              >
                <View style={[styles.mapCardDot, { backgroundColor: item.color }]} />
                <View>
                  <Text style={styles.mapCardName}>{item.nom}</Text>
                  <Text style={styles.mapCardMeta}>{item.surface} ha · {item.culture}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Détail bottom sheet */}
          {selectedField && (
            <FieldDetail field={selectedField} onClose={() => setSelected(null)} />
          )}
        </View>
      )}

      {/* Modal formulaire */}
      <FieldForm visible={showForm} onClose={() => setShowForm(false)} onSave={handleSave} />

      {/* Bottom nav — Fields actif */}
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

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },

  /* Header */
  header: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: { flexDirection: 'row' },
  logoAgri:  { fontSize: 22, fontWeight: '700', color: GREEN_DARK, letterSpacing: 0.3 },
  logoSmart: { fontSize: 22, fontWeight: '700', color: '#8bc34a',  letterSpacing: 0.3 },

  /* Toggle liste/carte */
  toggleRow: {
    flexDirection: 'row', backgroundColor: '#e0e0e0',
    borderRadius: 10, overflow: 'hidden',
  },
  toggleBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
  },
  toggleBtnActive: {
    backgroundColor: GREEN_DARK, borderRadius: 10,
  },

  /* Section */
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  sectionTitleWrapper: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginLeft: 8 },

  /* Stats */
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  statChip: {
    flex: 1, backgroundColor: '#ececec', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center',
  },
  statChipValue: { fontSize: 20, fontWeight: '600', color: '#333' },
  statChipLabel: { fontSize: 11, color: '#888', marginTop: 2 },

  /* Liste */
  listContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
    overflow: 'hidden',
  },
  cardSelected: {
    borderWidth: 1.5, borderColor: GREEN_DARK,
  },
  cardColorBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
  },
  cardIconBox: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: GREEN_LIGHT, justifyContent: 'center',
    alignItems: 'center', marginRight: 12, marginLeft: 8,
  },
  cardBody: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 3 },
  cardMeta: { fontSize: 12, color: '#888' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusActive: { backgroundColor: '#e8f5e9' },
  statusRest:   { backgroundColor: '#f5f5f5' },
  statusText:   { fontSize: 11, fontWeight: '600' },
  statusTextActive: { color: GREEN_DARK },
  statusTextRest:   { color: '#888' },

  /* Carte */
  mapContainer: { flex: 1 },
  map: { flex: 1 },

  markerBox: {
    backgroundColor: '#fff',
    borderRadius: 10, borderWidth: 1.5,
    paddingHorizontal: 8, paddingVertical: 4,
    alignItems: 'center', flexDirection: 'row', gap: 4,
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 3,
  },
  markerBoxSelected: { backgroundColor: GREEN_LIGHT },
  markerLabel: { fontSize: 11, fontWeight: '700' },

  /* Mini cartes horizontales */
  mapCardsScroll: {
    position: 'absolute', bottom: 10, left: 0, right: 0,
  },
  mapCardsList: { paddingHorizontal: 12, gap: 10 },
  mapCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    minWidth: 150,
  },
  mapCardSelected: { borderWidth: 1.5, borderColor: GREEN_DARK },
  mapCardDot: { width: 10, height: 10, borderRadius: 5 },
  mapCardName: { fontSize: 13, fontWeight: '700', color: '#222' },
  mapCardMeta: { fontSize: 11, color: '#888', marginTop: 2 },

  /* Détail bottom sheet */
  detailSheet: {
    position: 'absolute', bottom: 90, left: 12, right: 12,
    backgroundColor: '#fff', borderRadius: 20, padding: 16,
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  detailHandle: {
    width: 40, height: 4, backgroundColor: '#e0e0e0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 12,
  },
  detailHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8,
  },
  detailColorDot: { width: 12, height: 12, borderRadius: 6 },
  detailName: { flex: 1, fontSize: 16, fontWeight: '700', color: '#222' },
  detailGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  detailItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%',
  },
  detailItemText: {},
  detailItemLabel: { fontSize: 11, color: '#aaa' },
  detailItemValue: { fontSize: 13, fontWeight: '600', color: '#333' },

  /* Modal */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '85%',
  },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 8, padding: 4 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginLeft: 10 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: INPUT_BG,
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4, marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 10 },

  button: {
    backgroundColor: GREEN_DARK, borderRadius: 12, paddingVertical: 17,
    alignItems: 'center', marginTop: 8, elevation: 3,
    shadowColor: GREEN_DARK, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.4 },

  /* Bottom nav */
  bottomNav: {
    flexDirection: 'row', backgroundColor: GREEN_LIGHT,
    paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default FieldScreen;
