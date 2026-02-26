import axios from 'axios';

const api = axios.create({
  // Railway linkinin doğruluğunu ve sonunda '/' olmadığını kontrol et
  baseURL: "https://aradiginibul-api-production.up.railway.app",
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;