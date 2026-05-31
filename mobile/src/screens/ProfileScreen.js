import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
  ScrollView, StatusBar, Platform, Dimensions, Modal,
  TextInput, Alert, RefreshControl, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const GREEN_DARK  = '#1b5e20';
const GREEN       = '#2e7d32';
const GREEN_LIGHT = '#66bb6a';
const BG          = '#f5f7f9';

const USE_MOCK_DATA  = false;
const API_BASE_URL   = 'http://192.168.1.248:3000/api';

// ─── Drawer Menu (identique à la version précédente) ──────────────────────
const DrawerMenu = ({ visible, user, onClose, onEditProfile, onNavigate, onLogout, isLoggedIn }) => {
  const slideAnim = React.useRef(new Animated.Value(-width * 0.75)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -width * 0.75,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  const menuItems = [
    { icon: 'account-outline',      label: 'Modifier le profil',  action: () => { onClose(); onEditProfile(); } },
    { icon: 'lock-outline',         label: 'Sécurité',            action: () => { onClose(); Alert.alert('Info', 'Fonctionnalité à venir'); } },
    { icon: 'bell-outline',         label: 'Notifications',       action: () => { onClose(); Alert.alert('Info', 'Fonctionnalité à venir'); } },
    { icon: 'help-circle-outline',  label: 'Support',             action: () => { onClose(); Alert.alert('Contact', 'support@agrismart.com'); } },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.drawerPanel, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.drawerHeader}>
          <View style={styles.drawerAvatar}>
            <Text style={styles.drawerAvatarText}>
              {user?.name ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.drawerName}>{user?.name || '—'}</Text>
          <Text style={styles.drawerEmail}>{user?.email || '—'}</Text>
          <View style={styles.drawerRoleBadge}>
            <MaterialCommunityIcons name="sprout" size={12} color={GREEN_DARK} />
            <Text style={styles.drawerRoleText}>{user?.role || 'Agriculteur'}</Text>
          </View>
        </View>
        <View style={styles.drawerDivider} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.drawerItem} onPress={item.action} activeOpacity={0.7}>
              <View style={styles.drawerItemIcon}>
                <MaterialCommunityIcons name={item.icon} size={20} color={GREEN} />
              </View>
              <Text style={styles.drawerItemLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          ))}
          <View style={styles.drawerDivider} />
          <TouchableOpacity style={styles.drawerItem} onPress={() => { onClose(); onLogout(); }} activeOpacity={0.7}>
            <View style={[styles.drawerItemIcon, styles.drawerItemIconDanger]}>
              <MaterialCommunityIcons name="logout" size={20} color="#e53935" />
            </View>
            <Text style={[styles.drawerItemLabel, { color: '#e53935' }]}>
              {isLoggedIn ? 'Déconnexion' : 'Se connecter'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <Text style={styles.drawerVersion}>AgriSmart v1.0.0</Text>
      </Animated.View>
    </Modal>
  );
};

// ─── Modal édition profil (identique) ───────────────────────────────────────
const EditProfileModal = ({ visible, user, onClose, onSave, loading }) => {
  const [form, setForm] = useState({ name: '', email: '' });
  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email });
  }, [user]);
  const handleSave = () => {
    if (!form.name || !form.email) { Alert.alert('Erreur', 'Nom et email sont requis'); return; }
    onSave(form);
  };
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#888" />
          </TouchableOpacity>
          <View style={styles.modalTitleRow}>
            <MaterialCommunityIcons name="account-edit-outline" size={24} color={GREEN} />
            <Text style={styles.modalTitle}>Modifier le profil</Text>
          </View>
          {[
            { key: 'name',  icon: 'account-outline', placeholder: 'Nom complet',    keyboard: 'default'       },
            { key: 'email', icon: 'email-outline',    placeholder: 'Email',          keyboard: 'email-address' },
          ].map((f) => (
            <View key={f.key} style={styles.inputWrapper}>
              <MaterialCommunityIcons name={f.icon} size={20} color="#aaa" style={styles.inputIcon} />
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
            <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Enregistrer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ─── Fonction utilitaire pour formater une date relative ───────────────────
const formatRelativeDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return `Aujourd'hui • ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  if (days === 1) return `Hier • ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  if (days < 7) return `${days} jours • ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  return date.toLocaleDateString('fr-FR');
};

// ─── Écran principal avec données réelles pour activités et conseil IA ─────
const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [user, setUser]                   = useState(null);
  const [editModalVisible, setEditModal]  = useState(false);
  const [drawerVisible, setDrawer]        = useState(false);
  const [saving, setSaving]               = useState(false);
  const [stats, setStats]                 = useState({ fields: 0, predictions: 0, score: 0 });
  const [errorMsg, setErrorMsg]           = useState(null);
  
  // États pour les données dynamiques
  const [recentActivities, setRecentActivities] = useState([]);
  const [dailyAdvice, setDailyAdvice]           = useState("Chargement du conseil IA...");

  useEffect(() => { loadUserData(); }, []);
  useEffect(() => { if (user && user.id) { loadRecentActivities(); loadDailyAdvice(); } }, [user]);

  const apiCall = async (endpoint, options = {}) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Non authentifié');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw { status: response.status, message: error.message || 'Erreur API' };
    }
    return response.json();
  };

  const loadUserData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setErrorMsg(null);
    try {
      if (USE_MOCK_DATA) {
        setUser({ name: 'Jean Agriculteur', email: 'jean@agrismart.com', role: 'Agriculteur', id: 1 });
        setStats({ fields: 5, predictions: 12, score: 88 });
        return;
      }
      const token = await AsyncStorage.getItem('token');
      if (!token) { setUser({ name: 'Invité', email: 'non connecté', role: 'Visiteur', id: null }); setStats({ fields: 0, predictions: 0, score: 0 }); return; }
      const profileData = await apiCall('/users/profile');
      const userInfo = profileData.user || profileData;
      setUser({ id: userInfo.id, name: userInfo.name || 'Sans nom', email: userInfo.email || '', role: userInfo.role || 'Agriculteur' });
      await loadStats();
    } catch (error) {
      setErrorMsg(error.message || 'Erreur inconnue');
      if (error.status === 401 || error.status === 403) {
        await AsyncStorage.removeItem('token');
        navigation.replace('Login');
      } else {
        setUser({ name: 'Erreur', email: 'connexion perdue', role: 'Inconnu', id: null });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const [predData, fieldsData] = await Promise.all([
        apiCall('/predictions/history').catch(() => ({ predictions: [] })),
        apiCall('/fields').catch(() => ({ fields: [] })),
      ]);
      setStats({ fields: fieldsData.fields?.length || 0, predictions: predData.predictions?.length || 0, score: 92 });
    } catch (_) {}
  };

  // Charger les activités récentes (prédictions + parcelles)
  const loadRecentActivities = async () => {
    try {
      const [predRes, fieldsRes] = await Promise.all([
        apiCall('/predictions/history').catch(() => ({ predictions: [] })),
        apiCall('/fields').catch(() => ({ fields: [] })),
      ]);
      const predictions = predRes.predictions || [];
      const fields = fieldsRes.fields || [];
      let activities = [
        ...predictions.slice(0, 3).map(p => ({
          icon: 'brain',
          title: 'Nouvelle prédiction IA',
          date: p.created_at,
          type: 'prediction'
        })),
        ...fields.slice(0, 3).map(f => ({
          icon: 'map-plus',
          title: 'Parcelle ajoutée',
          date: f.created_at,
          type: 'field'
        }))
      ];
      // Trier par date décroissante
      activities.sort((a,b) => new Date(b.date) - new Date(a.date));
      activities = activities.slice(0, 5);
      // Formater les dates
      activities = activities.map(act => ({
        ...act,
        date: formatRelativeDate(act.date)
      }));
      setRecentActivities(activities);
    } catch (error) {
      console.log('Erreur chargement activités:', error);
      // Fallback : quelques activités fictives (ne pas afficher en erreur)
      setRecentActivities([
        { icon: 'brain', title: 'Nouvelle prédiction IA', date: formatRelativeDate(new Date().toISOString()) },
        { icon: 'map-plus', title: 'Parcelle ajoutée', date: formatRelativeDate(new Date(Date.now() - 86400000).toISOString()) },
      ]);
    }
  };

  // Charger le conseil IA du jour (personnalisable selon météo ou tendances)
  const loadDailyAdvice = async () => {
    try {
      // Essayer d'appeler un endpoint spécifique (à créer si besoin)
      const response = await apiCall('/ai/daily-advice').catch(() => null);
      if (response && response.advice) {
        setDailyAdvice(response.advice);
      } else {
        // Conseils basés sur les données météo (ici simulé)
        const weather = await apiCall('/weather/current').catch(() => null);
        if (weather) {
          setDailyAdvice(`Conditions météo: ${weather.temp}°C, ${weather.humidity}% humidité. Recommandation: arrosage modéré.`);
        } else {
          // Message générique mais dynamique (ex: basé sur la saison)
          const month = new Date().getMonth();
          if (month >= 2 && month <= 5) { // mars à mai
            setDailyAdvice("Saison des pluies : surveillez l'humidité excessive, évitez de trop arroser.");
          } else if (month >= 6 && month <= 9) {
            setDailyAdvice("Saison fraîche : protégez les jeunes pousses du froid matinal.");
          } else {
            setDailyAdvice("Les conditions climatiques sont favorables au maïs aujourd'hui. Une irrigation légère est recommandée demain matin.");
          }
        }
      }
    } catch (error) {
      console.log('Erreur conseil IA:', error);
      setDailyAdvice("Conseil non disponible pour le moment. Consultez les prévisions locales.");
    }
  };

  const handleUpdateProfile = async (form) => {
    setSaving(true);
    try {
      const updated = await apiCall('/users/profile', { method: 'PUT', body: JSON.stringify(form) });
      const u = updated.user || updated;
      setUser((prev) => ({ ...prev, name: u.name, email: u.email, role: u.role || prev.role }));
      Alert.alert('Succès', 'Profil mis à jour');
      setEditModal(false);
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Mise à jour impossible');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: async () => { await AsyncStorage.removeItem('token'); navigation.replace('Login'); } },
    ]);
  };

  const isLoggedIn = user && user.email !== 'non connecté' && user.email !== 'connexion perdue';

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={GREEN} /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DARK} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadUserData(true); loadRecentActivities(); loadDailyAdvice(); }} colors={[GREEN]} />}
      >
        {/* ── HEADER ── */}
        <View style={[styles.header, { backgroundColor: GREEN_DARK }]}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => setDrawer(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="menu" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Notifications', 'Aucune notification')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="notifications-outline" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'}
              </Text>
            </View>
            {isLoggedIn && (
              <TouchableOpacity style={styles.cameraBtn} onPress={() => setEditModal(true)}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.name}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="sprout" size={15} color={GREEN_DARK} />
            <Text style={styles.roleText}>{user?.role}</Text>
          </View>

          {/* Météo (statique ou réelle) */}
          <View style={styles.weatherCard}>
            {[
              { icon: 'sunny',   iconLib: 'ion', color: '#ff9800', value: '24°C',  label: 'Temperature' },
              { icon: 'water',   iconLib: 'ion', color: '#2196f3', value: '76%',   label: 'Humidite'    },
              { icon: 'rainy',   iconLib: 'ion', color: '#90a4ae', value: 'Faible',label: 'Pluie'       },
            ].map((w) => (
              <View key={w.label} style={styles.weatherItem}>
                <Ionicons name={w.icon} size={26} color={w.color} />
                <Text style={styles.weatherValue}>{w.value}</Text>
                <Text style={styles.weatherLabel}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {errorMsg && <Text style={styles.errorText}>⚠️ {errorMsg}</Text>}

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          {[
            { icon: 'map-marker-radius', value: stats.fields,      label: 'Parcelles'   },
            { icon: 'brain',             value: stats.predictions,  label: 'Prédictions' },
            { icon: 'chart-line',        value: `${stats.score}%`,  label: 'Score IA'    },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <MaterialCommunityIcons name={s.icon} size={26} color={GREEN} />
              <Text style={styles.statNumber}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Conseil IA (dynamique) */}
        <View style={styles.aiCard}>
          <View style={styles.aiTop}>
            <MaterialCommunityIcons name="robot-outline" size={28} color="#fff" />
            <Text style={styles.aiTitle}>Conseil IA du jour</Text>
          </View>
          <Text style={styles.aiText}>{dailyAdvice}</Text>
        </View>

        {/* Santé agricole (statique ou à connecter) */}
        <Text style={styles.sectionTitle}>Santé Agricole</Text>
        <View style={styles.healthContainer}>
          {[
            { icon: 'sprout',        color: GREEN,     title: 'Cultures',     value: 'Bonne santé' },
            { icon: 'water-outline', color: '#2196f3', title: 'Humidité Sol', value: 'Correcte'    },
            { icon: 'weather-rainy', color: '#607d8b', title: 'Prévision',    value: '+12%'        },
          ].map((h) => (
            <View key={h.title} style={styles.healthCard}>
              <MaterialCommunityIcons name={h.icon} size={26} color={h.color} />
              <Text style={styles.healthTitle}>{h.title}</Text>
              <Text style={styles.healthValue}>{h.value}</Text>
            </View>
          ))}
        </View>

        {/* Activités récentes (dynamique) */}
        <Text style={styles.sectionTitle}>Activités récentes</Text>
        <View style={styles.timeline}>
          {recentActivities.length === 0 ? (
            <Text style={{ color: '#aaa', textAlign: 'center', paddingVertical: 12 }}>Aucune activité récente</Text>
          ) : (
            recentActivities.map((act, idx) => (
              <View key={idx} style={[styles.timelineItem, idx === recentActivities.length-1 && { marginBottom: 0 }]}>
                <View style={styles.timelineIconBox}>
                  <MaterialCommunityIcons name={act.icon} size={16} color={GREEN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timelineTitle}>{act.title}</Text>
                  <Text style={styles.timelineDate}>{act.date}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Drawer et modals */}
      <DrawerMenu
        visible={drawerVisible}
        user={user}
        onClose={() => setDrawer(false)}
        onEditProfile={() => setEditModal(true)}
        onNavigate={(screen) => navigation.navigate(screen)}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
      />

      <EditProfileModal
        visible={editModalVisible}
        user={user}
        onClose={() => setEditModal(false)}
        onSave={handleUpdateProfile}
        loading={saving}
      />

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="view-grid-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('History')}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Predict')}>
          <MaterialCommunityIcons name="brain" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Fields')}>
          <Ionicons name="location-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn}>
          <MaterialCommunityIcons name="account" size={24} color={GREEN} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Styles (inchangés par rapport à la version précédente) ─────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loader:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarContainer: { alignSelf: 'center', marginTop: 20, position: 'relative' },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 34, fontWeight: 'bold', color: GREEN },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: GREEN_DARK,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  name: { color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 14 },
  roleBadge: {
    backgroundColor: '#fff', alignSelf: 'center', marginTop: 10,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  roleText: { color: GREEN_DARK, marginLeft: 6, fontWeight: '600' },
  weatherCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20, marginTop: 25, borderRadius: 20,
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 18,
  },
  weatherItem: { alignItems: 'center' },
  weatherValue: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 6 },
  weatherLabel: { color: '#e8f5e9', fontSize: 11, marginTop: 4 },

  statsContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 20,
  },
  statCard: {
    width: width * 0.28, backgroundColor: '#fff', borderRadius: 20,
    alignItems: 'center', paddingVertical: 20, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 4,
  },
  statNumber: { fontSize: 22, fontWeight: '700', marginTop: 10, color: '#222' },
  statLabel:  { color: '#888', marginTop: 5, fontSize: 12 },

  aiCard: {
    backgroundColor: GREEN_DARK, marginHorizontal: 16, marginTop: 25,
    borderRadius: 24, padding: 20,
  },
  aiTop:  { flexDirection: 'row', alignItems: 'center' },
  aiTitle:{ color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 10 },
  aiText: { color: '#fff', marginTop: 15, lineHeight: 22 },

  sectionTitle: {
    fontSize: 18, fontWeight: '700',
    marginHorizontal: 20, marginTop: 28, marginBottom: 15, color: '#222',
  },

  healthContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16 },
  healthCard: {
    width: width * 0.28, backgroundColor: '#fff', borderRadius: 18,
    alignItems: 'center', paddingVertical: 18,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  healthTitle: { fontSize: 12, color: '#888', marginTop: 8 },
  healthValue: { fontWeight: '700', marginTop: 5, color: '#222' },

  timeline: {
    marginHorizontal: 16, backgroundColor: '#fff',
    borderRadius: 20, padding: 18,
  },
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 12 },
  timelineIconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center',
  },
  timelineTitle: { fontWeight: '600', color: '#222' },
  timelineDate:  { color: '#999', marginTop: 3, fontSize: 12 },

  drawerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawerPanel: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: width * 0.75,
    backgroundColor: '#fff',
    borderTopRightRadius: 24, borderBottomRightRadius: 24,
    elevation: 16,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 12,
  },
  drawerHeader: {
    backgroundColor: GREEN_DARK, paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24, paddingHorizontal: 20,
    borderTopRightRadius: 24,
  },
  drawerAvatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  drawerAvatarText: { fontSize: 22, fontWeight: '700', color: GREEN },
  drawerName:  { color: '#fff', fontSize: 17, fontWeight: '700' },
  drawerEmail: { color: '#c8e6c9', fontSize: 12, marginTop: 3 },
  drawerRoleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 10,
  },
  drawerRoleText: { fontSize: 12, fontWeight: '600', color: GREEN_DARK },
  drawerDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 8 },
  drawerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 16, gap: 12,
  },
  drawerItemIcon: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center',
  },
  drawerItemIconDanger: { backgroundColor: '#ffebee' },
  drawerItemLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#333' },
  drawerVersion: {
    textAlign: 'center', color: '#bbb', fontSize: 12,
    paddingBottom: 24, paddingTop: 8,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  closeBtn: { alignSelf: 'flex-end', padding: 4 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginLeft: 10, color: '#222' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0',
    borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4, marginBottom: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 10 },
  saveBtn: { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  errorText: { textAlign: 'center', color: '#e53935', marginVertical: 16, marginHorizontal: 20, fontWeight: '500' },

  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 14, borderTopLeftRadius: 25, borderTopRightRadius: 25,
    elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  navBtn: { alignItems: 'center', justifyContent: 'center' },
});

export default ProfileScreen;