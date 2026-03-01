import axios from 'axios';

const api = axios.create({
  baseURL: "https://aradiginibul-api-production.up.railway.app",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Her istekte JWT token'ı otomatik olarak Authorization header'ına ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// JWT token'ından kullanıcı email'ini çözen yardımcı fonksiyon
// Bu fonksiyon backend'e çağrı yapmadan, token'ın payload kısmını decode eder
export function getUserEmailFromToken(): string | null {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    // JWT formatı: header.payload.signature — payload kısmını al ve decode et
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null; // "sub" alanı = kullanıcının email'i
  } catch {
    return null;
  }
}

export default api;