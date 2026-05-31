import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de l'API (remplace par ton IP)
const API_URL = 'http://192.168.1.248:3000/api';
const AI_URL = 'http://192.168.1.248:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 secondes timeout
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  console.log('📤 Requête:', config.method?.toUpperCase(), config.url);
  console.log('🔑 Token:', token ? '✅ Présent' : '❌ Absent');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.log('❌ Erreur intercepteur requête:', error);
  return Promise.reject(error);
});

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log('✅ Succès:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.log('❌ Erreur:', error.response?.status, error.response?.config?.url);
    console.log('📝 Message:', error.response?.data?.message || error.message);
    
    // Si token expiré (401) ou non autorisé (403), déconnecter l'utilisateur
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔒 Token invalide ou expiré, déconnexion...');
      await AsyncStorage.removeItem('token');
      // Optionnel: rediriger vers login (à gérer dans le composant)
    }
    
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  login: (email, password) => api.post('/users/login', { email, password }),
  register: (name, email, password, role) => 
    api.post('/users/register', { name, email, password, role }),
  logout: () => AsyncStorage.removeItem('token')
};

// Service utilisateur
export const userService = {
  // Récupérer le profil de l'utilisateur connecté
  getProfile: () => api.get('/users/profile'),
  
  // Mettre à jour le profil
  updateProfile: (data) => api.put('/users/profile', data),
  
  // Changer le mot de passe
  changePassword: (oldPassword, newPassword) => 
    api.post('/users/change-password', { oldPassword, newPassword }),
  
  // Supprimer le compte
  deleteAccount: () => api.delete('/users/account'),
};

// Service de prédiction
export const predictService = {
  // Prédiction (AI service - pas d'auth nécessaire)
  predict: (data) => {
    console.log('🤖 Prédiction:', data);
    return axios.post(`${AI_URL}/predict`, data, {
      timeout: 30000, // 30 secondes pour l'IA
    });
  },
  
  // Sauvegarder une prédiction (API principale - auth nécessaire)
  savePrediction: async (data) => {
    const token = await AsyncStorage.getItem('token');
    console.log('💾 Sauvegarde prédiction avec token:', token ? 'Oui' : 'Non');
    if (!token) {
      throw new Error('Non authentifié');
    }
    return api.post('/predictions/save', data);
  },
  
  // Récupérer l'historique (API principale - auth nécessaire)
  getHistory: async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('📜 Historique avec token:', token ? 'Oui' : 'Non');
    if (!token) {
      return { data: { predictions: [] } };
    }
    return api.get('/predictions/history');
  },
  
  // Récupérer une prédiction spécifique
  getPrediction: (id) => api.get(`/predictions/${id}`),
  
  // Supprimer une prédiction
  deletePrediction: (id) => api.delete(`/predictions/${id}`),
  
  // Mettre à jour une prédiction
  updatePrediction: (id, data) => api.put(`/predictions/${id}`, data),
};

// Service des parcelles
export const fieldService = {
  getFields: () => api.get('/fields'),
  getField: (id) => api.get(`/fields/${id}`),
  createField: (data) => api.post('/fields', data),
  updateField: (id, data) => api.put(`/fields/${id}`, data),
  deleteField: (id) => api.delete(`/fields/${id}`),
  
  // Statistiques des parcelles
  getFieldStats: () => api.get('/fields/stats'),
};

// Service des notifications (optionnel)
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Service des cultures (optionnel)
export const cultureService = {
  getCultures: () => api.get('/cultures'),
  getCulture: (id) => api.get(`/cultures/${id}`),
  getRecommendations: (data) => api.post('/cultures/recommendations', data),
};

// Service de météo (optionnel)
export const weatherService = {
  getWeather: (lat, lng) => api.get(`/weather?lat=${lat}&lng=${lng}`),
  getForecast: (lat, lng, days = 7) => api.get(`/weather/forecast?lat=${lat}&lng=${lng}&days=${days}`),
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('token');
  return !!token;
};

// Obtenir le token
export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

// Configurer l'URL de l'API (utile pour les changements dynamiques)
export const setApiUrl = (newUrl) => {
  api.defaults.baseURL = newUrl;
  console.log('🌐 API URL changée:', newUrl);
};

// Exporter l'instance api pour les cas particuliers
export default api;