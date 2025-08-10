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

// Función para decodificar un token JWT sin verificar la firma (solo para obtener el exp)
const decodeTokenPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Función para verificar si el token está próximo a expirar (dentro de 10 minutos)
const isTokenNearExpiry = (token) => {
  const payload = decodeTokenPayload(token);
  if (!payload || !payload.exp) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - currentTime;
  
  // Si queda menos de 10 minutos (600 segundos), necesita renovación
  return timeUntilExpiry < 600;
};

// Función para renovar el token
const refreshTokenInternal = async () => {
  const currentToken = getToken();
  if (!currentToken) return null;

  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      console.log('Token renovado exitosamente');
      return response.data.token;
    }
  } catch (error) {
    console.error('Error renovando token:', error);
    return null;
  }
};

// Función para configurar el interceptor de Axios
export const setupAxiosInterceptors = (logout) => {
  // Interceptor de solicitudes - añade token automáticamente y verifica si necesita renovación
  axios.interceptors.request.use(
    async (config) => {
      const token = getToken();
      if (token) {
        // Verificar si el token necesita renovación antes de usarlo
        if (isTokenNearExpiry(token)) {
          console.log('Token próximo a expirar, intentando renovar...');
          const newToken = await refreshToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          } else {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de respuestas - maneja errores de autenticación con intento de refresh
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        console.log('Token expirado, intentando renovar...');
        const newToken = await refreshToken();
        
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest); // Reintentar la petición original
        } else {
          // Si no se puede renovar el token, hacer logout
          console.log('No se pudo renovar el token, cerrando sesión...');
          
          if (!window.isLoggingOut) {
            window.isLoggingOut = true;
            toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            clearAuthData();
            logout();
            
            setTimeout(() => {
              window.isLoggingOut = false;
            }, 1000);
          }
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
