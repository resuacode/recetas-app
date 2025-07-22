// frontend/src/utils/auth.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Variable para evitar múltiples validaciones simultáneas
let isValidating = false;

// Función para validar si un token es válido haciendo una petición al backend
export const validateToken = async (token) => {
  if (!token) {
    return false;
  }

  try {
    const response = await axios.get(`${API_URL}/auth/validate-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 segundos de timeout
    });
    return response.status === 200;
  } catch (error) {
    console.log('Token validation failed:', error.response?.status || error.message);
    return false;
  }
};

// Función para limpiar toda la información de sesión
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

// Función para obtener el token del localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Función para configurar el interceptor de Axios
export const setupAxiosInterceptors = (logout) => {
  // Interceptor de solicitudes - añade token automáticamente
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de respuestas - maneja errores de autenticación
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, logging out...');
        
        // Evitar múltiples toast si ya se está procesando el logout
        if (!window.isLoggingOut) {
          window.isLoggingOut = true;
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          clearAuthData();
          logout(); // Función que viene del contexto de la app
          
          // Reset flag después de un tiempo
          setTimeout(() => {
            window.isLoggingOut = false;
          }, 1000);
        }
      }
      return Promise.reject(error);
    }
  );
};

// Función para verificar la sesión al cargar la aplicación
export const checkSession = async () => {
  // Evitar múltiples validaciones simultáneas
  if (isValidating) {
    console.log('Session validation already in progress, skipping...');
    return { isValid: false };
  }

  isValidating = true;
  
  // Timeout de seguridad para resetear isValidating en caso de error
  const timeoutId = setTimeout(() => {
    console.log('Session validation timeout, resetting flag...');
    isValidating = false;
  }, 15000); // 15 segundos
  
  try {
    const token = getToken();
    const userString = localStorage.getItem('user');
    const roleString = localStorage.getItem('role');

    if (!token || !userString || !roleString) {
      clearAuthData();
      return { isValid: false };
    }

    try {
      // Validar que el JSON esté bien formado
      const parsedUser = JSON.parse(userString);
      const parsedRole = JSON.parse(roleString);

      // Validar el token con el backend
      const isTokenValid = await validateToken(token);
      
      if (isTokenValid) {
        return {
          isValid: true,
          user: parsedUser,
          role: parsedRole,
          token: token
        };
      } else {
        clearAuthData();
        return { isValid: false };
      }
    } catch (error) {
      console.error('Error validating session:', error);
      clearAuthData();
      return { isValid: false };
    }
  } finally {
    clearTimeout(timeoutId);
    isValidating = false;
  }
};

// Función para refrescar el token (si el backend lo soporta)
export const refreshToken = async () => {
  try {
    const token = getToken();
    if (!token) return null;

    const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    }
    return null;
  } catch (error) {
    console.log('Token refresh failed:', error);
    return null;
  }
};
