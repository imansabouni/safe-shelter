import axios from 'axios';
import Constants from 'expo-constants';

// Expo üzerinden bilgisayarın IP adresini otomatik olarak tespit ediyoruz.
// Bu sayede WiFi değiştiğinde IP adresini her seferinde manuel güncellemenize gerek kalmaz.
const localhost = '1.1.12.11'; // Node.js proxy üzerinden geçiyoruz (Firewall bypass)

const api = axios.create({
  baseURL: `http://${localhost}:8082/api/`, 
  timeout: 10000, // Bağlantı süresini biraz daha artırdık
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

delete api.defaults.headers.common['Authorization'];

// Gerekirse Token eklemek için Interceptor
api.interceptors.request.use((config) => {
  // Eğer elinizde bir token varsa buraya ekleyebilirsiniz:
  // const token = 'BURAYA_TOKEN_GELECEK';
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
