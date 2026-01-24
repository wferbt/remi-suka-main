import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // УБЕДИСЬ, ЧТО ПОРТ 3000 УКАЗАН
});

export default api;