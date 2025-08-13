// frontend/src/utils/auth.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Variables para control de renovación
let isValidating = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;

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
      timeout: 5000, // 5 segundos de timeout reducido
    });
    return response.status === 200;
  } catch (error) {
    // Si es un error de red o timeout, asumir que el token podría ser válido
    if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR' || !error.response) {
      console.log('Error de red durante validación de token, asumiendo válido temporalmente');
      return true; // Permitir continuar si hay problemas de red
    }
    
    console.log('Token validation failed:', error.response?.status || error.message);
    return false;
  }
};

// Función para limpiar toda la información de sesión
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
  refreshAttempts = 0; // Resetear contador de intentos
  isValidating = false; // Resetear flag de validación
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

// Función para verificar si el token está expirado (offline)
const isTokenExpired = (token) => {
  const payload = decodeTokenPayload(token);
  if (!payload || !payload.exp) return true; // Si no se puede decodificar, considerar expirado
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp <= currentTime;
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
    console.log('Session validation timeout, clearing session...');
    isValidating = false;
    clearAuthData();
  }, 8000); // 8 segundos
  
  try {
    const token = getToken();
    const userString = localStorage.getItem('user');
    const roleString = localStorage.getItem('role');

    // Si falta cualquier dato, limpiar todo
    if (!token || !userString || !roleString) {
      clearAuthData();
      return { isValid: false };
    }

    let parsedUser, parsedRole;
    try {
      parsedUser = JSON.parse(userString);
      parsedRole = JSON.parse(roleString);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      clearAuthData();
      return { isValid: false };
    }

    // Verificar si el token está expirado
    if (isTokenExpired(token)) {
      console.log('Token expirado, intentando renovar...');
      const newToken = await refreshToken();
      if (!newToken) {
        console.log('No se pudo renovar el token expirado');
        clearAuthData();
        return { isValid: false };
      }
      
      // Usar el nuevo token
      token = newToken;
    }

    // Intentar validar con el backend UNA SOLA VEZ
    const isTokenValid = await validateToken(token);
    
    if (isTokenValid) {
      refreshAttempts = 0; // Resetear contador de intentos en caso de éxito
      return {
        isValid: true,
        user: parsedUser,
        role: parsedRole,
        token: token
      };
    } else {
      // Si falla la validación, limpiar inmediatamente
      console.log('Token no válido, limpiando sesión');
      clearAuthData();
      return { isValid: false };
    }
  } catch (error) {
    console.error('Error during session validation:', error);
    clearAuthData();
    return { isValid: false };
  } finally {
    clearTimeout(timeoutId);
    isValidating = false;
  }
};

// Función para refrescar el token (si el backend lo soporta)
export const refreshToken = async () => {
  // Verificar límite de intentos
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.log('Máximo de intentos de renovación alcanzado, limpiando sesión');
    clearAuthData();
    refreshAttempts = 0;
    return null;
  }

  try {
    const token = getToken();
    if (!token) return null;

    refreshAttempts++;
    console.log(`Intento de renovación ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS}`);

    const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000, // 5 segundos de timeout
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      refreshAttempts = 0; // Resetear contador en caso de éxito
      return response.data.token;
    }
    return null;
  } catch (error) {
    console.log('Token refresh failed:', error.response?.status || error.message);
    
    // Si es un error 401 o 403, el refresh token también está expirado
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Refresh token expirado, limpiando sesión');
      clearAuthData();
      refreshAttempts = 0;
      return null;
    }
    
    return null;
  }
};
