import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, StatusBar, Platform, RefreshControl, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { predictService } from '../services/api';

const GREEN_DARK  = '#2e7d32';
const GREEN_LIGHT = '#e8f5e9';

// ─── Formatage date ───────────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  const dd   = d.getDate().toString().padStart(2, '0');
  const mm   = (d.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh   = d.getHours().toString().padStart(2, '0');
  const min  = d.getMinutes().toString().padStart(2, '0');
  return { date: `${dd}-${mm}-${yyyy}`, time: `${hh}:${min}` };
};

// ─── Couleur rendement ────────────────────────────────────────────────────────
const rendementColor = (val) => {
  const v = parseFloat(val);
  if (v >= 4)    return '#2e7d32';
  if (v >= 2.5)  return '#f9a825';
  return '#e53935';
};

// ─── Card prédiction ──────────────────────────────────────────────────────────
const PredictionCard = ({ item, expanded, onToggle }) => {
  const { date, time } = formatDate(item.created_at);
  const rendement = parseFloat(item.rendement_prevu || 0).toFixed(1);
  const surface   = parseFloat(item.surface_ha || 0).toFixed(1);
  const culture   = item.culture_type || 'Culture';
  const sol       = item.type_sol || item.soil_type || 'Non spécifié';
  const pluie     = item.pluie_mm ?? item.rainfall ?? '—';
  const temp      = item.temperature_c ?? item.temperature ?? '—';
  const rColor    = rendementColor(rendement);

  const details = [
    { icon: 'shovel',        label: 'Type de sol',  value: sol                  },
    { icon: 'resize',        label: 'Surface',      value: `${surface} ha`      },
    { icon: 'weather-rainy', label: 'Pluie',        value: `${pluie} mm`        },
    { icon: 'thermometer',   label: 'Température',  value: `${temp} °C`         },
  ];

  return (
    <View style={styles.cardWrapper}>
      {/* Date au-dessus */}
      <View style={styles.dateRow}>
        <MaterialCommunityIcons name="clipboard-check-outline" size={16} color="#aaa" />
        <Text style={styles.dateText}>{date}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      {/* Carte principale */}
      <TouchableOpacity style={styles.card} onPress={onToggle} activeOpacity={0.85}>

        {/* En-tête carte : culture + icone brain + rendement */}
        <View style={styles.cardTop}>
          <View style={styles.cultureRow}>
            <View style={styles.cultureIconBox}>
              <MaterialCommunityIcons name="sprout" size={18} color={GREEN_DARK} />
            </View>
            <Text style={styles.cultureName}>Culture : <Text style={styles.cultureValue}>{culture}</Text></Text>
          </View>
          <MaterialCommunityIcons name="brain" size={22} color="#ccc" />
        </View>

        {/* Détails toujours visibles */}
        <View style={styles.detailsGrid}>
          {details.map((d) => (
            <View key={d.label} style={styles.detailItem}>
              <View style={styles.detailDot} />
              <MaterialCommunityIcons name={d.icon} size={13} color="#aaa" style={{ marginRight: 4 }} />
              <Text style={styles.detailLabel}>{d.label} : </Text>
              <Text style={styles.detailValue}>{d.value}</Text>
            </View>
          ))}
        </View>

        {/* Rendement */}
        <View style={styles.rendementBox}>
          <Text style={styles.rendementLabel}>Rendement estimé</Text>
          <Text style={[styles.rendementValue, { color: rColor }]}>{rendement} t/ha</Text>
          <View style={[styles.rendementBar, { backgroundColor: rColor + '22' }]}>
            <View style={[styles.rendementBarFill, {
              backgroundColor: rColor,
              width: `${Math.min((parseFloat(rendement) / 6) * 100, 100)}%`
            }]} />
          </View>
        </View>

        {/* Indicateur expand */}
        <View style={styles.expandRow}>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#ccc"
          />
        </View>

        {/* Section étendue */}
        {expanded && (
          <View style={styles.expandedSection}>
            <View style={styles.expandedDivider} />
            <View style={styles.expandedRow}>
              <MaterialCommunityIcons name="calendar-outline" size={14} color="#aaa" />
              <Text style={styles.expandedText}>
                Date de semis : {item.date_semis || '—'}
              </Text>
            </View>
            <View style={styles.expandedRow}>
              <MaterialCommunityIcons name="scale-balance" size={14} color="#aaa" />
              <Text style={styles.expandedText}>
                Unité : {item.unite_rendement || 'tonnes/ha'}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const HistoryScreen = ({ navigation }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [expandedId, setExpandedId]   = useState(null);

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    try {
      const response = await predictService.getHistory();
      setPredictions(response.data.predictions || []);
    } catch (error) {
      console.log('Erreur historique', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <MaterialCommunityIcons name="clock-outline" size={20} color="#333" />
      <Text style={styles.listHeaderText}>Historique</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{predictions.length}</Text>
      </View>
    </View>
  );

  const Empty = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#ddd" />
      <Text style={styles.emptyTitle}>Aucune prédiction</Text>
      <Text style={styles.emptySubtitle}>Vos prédictions apparaîtront ici</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Predict')}>
        <MaterialCommunityIcons name="brain" size={16} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.emptyBtnText}>Faire une prédiction</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GREEN_DARK} />
      </View>
    );
  }

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

      {/* Liste */}
      <FlatList
        data={predictions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PredictionCard
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => handleToggle(item.id)}
          />
        )}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={<Empty />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadHistory(); }}
            colors={[GREEN_DARK]}
          />
        }
      />

      {/* Bottom nav — History actif */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="view-grid" size={26} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Header */
  header: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 14,
  },
  logoContainer: { flexDirection: 'row' },
  logoAgri:  { fontSize: 22, fontWeight: '700', color: GREEN_DARK, letterSpacing: 0.3 },
  logoSmart: { fontSize: 22, fontWeight: '700', color: '#8bc34a',  letterSpacing: 0.3 },

  /* Liste */
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  listHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 16,
  },
  listHeaderText: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1 },
  countBadge: {
    backgroundColor: GREEN_DARK, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  countBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  /* Card */
  cardWrapper: { marginBottom: 16 },

  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 6, paddingLeft: 4,
  },
  dateText: { fontSize: 13, fontWeight: '600', color: '#555' },
  timeText: { fontSize: 12, color: '#aaa' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },

  /* Top row : culture + brain */
  cardTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  cultureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cultureIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: GREEN_LIGHT, justifyContent: 'center', alignItems: 'center',
  },
  cultureName:  { fontSize: 14, color: '#555', fontWeight: '500' },
  cultureValue: { fontWeight: '700', color: '#222' },

  /* Détails grille */
  detailsGrid: { gap: 5, marginBottom: 14 },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#ccc', marginRight: 6,
  },
  detailLabel: { fontSize: 12, color: '#888' },
  detailValue: { fontSize: 12, fontWeight: '600', color: '#444' },

  /* Rendement */
  rendementBox: {
    backgroundColor: GREEN_LIGHT, borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 8,
  },
  rendementLabel: { fontSize: 12, color: '#555', fontWeight: '500', marginBottom: 4 },
  rendementValue: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  rendementBar:   { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  rendementBarFill: { height: 6, borderRadius: 3 },

  /* Expand */
  expandRow: { alignItems: 'center' },
  expandedSection: { paddingTop: 10 },
  expandedDivider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 10 },
  expandedRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  expandedText:    { fontSize: 12, color: '#888' },

  /* Empty */
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyTitle:    { fontSize: 17, fontWeight: '700', color: '#555', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#aaa', marginTop: 8 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: GREEN_DARK, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 20, marginTop: 24,
  },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

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

export default HistoryScreen;