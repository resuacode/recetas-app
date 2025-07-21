// frontend/src/utils/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Crear una instancia personalizada de axios
const api = axios.create({
  baseURL: API_URL,
});

// Esta instancia ya tendrá los interceptores configurados desde App.jsx
// No necesita configuración adicional aquí

export default api;
