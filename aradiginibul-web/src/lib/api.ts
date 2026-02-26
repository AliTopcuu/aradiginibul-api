import axios from 'axios';

// Railway linkinin sonuna '/' eklemediğinden emin ol
const api = axios.create({
  baseURL: "https://aradiginibul-api-production.up.railway.app", 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;