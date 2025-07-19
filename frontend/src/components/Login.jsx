import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Login = ({ onLoginSuccess }) => { // onLoginSuccess será una función para manejar el token
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carga



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Activar estado de carga

    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        username,
        password,
      });
      toast.success('¡Inicio de sesión exitoso!');
      // console.log('Inicio de sesión:', response.data);

      // Almacena el token JWT y la información del usuario
      // IMPORTANTE: En una aplicación real, esto se manejaría con un contexto/estado global
      // o una librería de autenticación. Por ahora, lo guardamos en localStorage.
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.username)); // Guarda el usuario también
      localStorage.setItem('role', response.data.role); // Guarda el rol del usuario
      
      // Llama a la función que se pase desde el padre para indicar que el login fue exitoso
      if (onLoginSuccess) {
        onLoginSuccess(response.data.token, response.data.username, response.data.role);
      }

      // Opcional: limpiar el formulario
      setUsername('');
      setPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error en el inicio de sesión');
      console.error('Error al iniciar sesión:', error.response?.data || error.message);
    } finally {
      setLoading(false); // Desactivar estado de carga al finalizar
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-username">Nombre de Usuario:</label>
          <input
            type="text"
            id="login-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="login-password">Contraseña:</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
      <div className="form-links">
        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Login;