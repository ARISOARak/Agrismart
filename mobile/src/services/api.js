import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de l'API (remplace par ton IP)
const API_URL = 'http://192.168.1.248:3000/api';
const AI_URL = 'http://192.168.1.248:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  console.log('Token pour', config.url, ':', token ? '✅ Présent' : '❌ Absent');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log('✅ Succès:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('❌ Erreur:', error.response?.status, error.response?.config?.url);
    console.log('Message:', error.response?.data?.message);
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

// Service de prédiction
export const predictService = {
  // Prédiction (AI service - pas d'auth nécessaire)
  predict: (data) => axios.post(`${AI_URL}/predict`, data),
  
  // Sauvegarder une prédiction (API principale - auth nécessaire)
  savePrediction: async (data) => {
    const token = await AsyncStorage.getItem('token');
    console.log('Sauvegarde avec token:', token ? 'Oui' : 'Non');
    if (!token) {
      throw new Error('Non authentifié');
    }
    return api.post('/predictions/save', data);
  },
  
  // Récupérer l'historique (API principale - auth nécessaire)
  getHistory: async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('Historique avec token:', token ? 'Oui' : 'Non');
    if (!token) {
      // Retourner un tableau vide si pas de token
      return { data: { predictions: [] } };
    }
    return api.get('/predictions/history');
  }
};

// Service des parcelles
export const fieldService = {
  getFields: () => api.get('/fields'),
  createField: (data) => api.post('/fields', data),
  updateField: (id, data) => api.put(`/fields/${id}`, data),
  deleteField: (id) => api.delete(`/fields/${id}`)
};

export default api;