import axios from 'axios';

// Railway üzerindeki canlı API adresin
const API_URL = "https://aradiginibul-api-production.up.railway.app";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;