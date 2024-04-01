import axios from 'axios';
const API_URL = 'http://localhost:3001'; 



const api = axios.create({
  baseURL: API_URL,
  headers: {
    'x-expo-app': 'chatfuze-frontend',
  }
});

export default api;