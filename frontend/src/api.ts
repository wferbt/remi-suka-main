import axios from 'axios';

const api = axios.create({
  baseURL: 'remi-suka-main-production.up.railway.app', // ВАЖНО для Android
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
