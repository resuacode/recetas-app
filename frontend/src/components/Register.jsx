import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        username,
        password,
      });
      toast.success('¡Registro exitoso! Ya puedes iniciar sesión.');
      // console.log('Usuario registrado:', response.data);
      // Opcional: podrías limpiar el formulario o redirigir al login
      setUsername('');
      setPassword('');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error en el registro');
      console.error('Error al registrar usuario:', error.response?.data || error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Registrar Nuevo Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Nombre de Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Registrar</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Register;