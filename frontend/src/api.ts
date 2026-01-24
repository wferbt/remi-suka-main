import axios from 'axios';

// Обязательно добавляем https:// в начало!
const api = axios.create({
  baseURL: 'https://remi-suka-main.onrender.com', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;