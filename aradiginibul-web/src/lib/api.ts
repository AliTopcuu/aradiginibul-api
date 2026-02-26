import axios from 'axios';

const api = axios.create({
  baseURL: "https://aradiginibul-api-production.up.railway.app", // Senin Railway adresin
});

// Her isteğe otomatik olarak token ekleyen bir koruma (İlerisi için hazır kalsın)
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;