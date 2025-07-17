import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptPrivacyPolicy, setAcceptPrivacyPolicy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setLoading(true);

    // Validación para aceptar la política de privacidad
    if (!acceptPrivacyPolicy) {
      toast.error('Debes aceptar la Política de Privacidad.');
      return;
    }

    // Validaciones básicas en el frontend
    if (password !== passwordConfirm) {
      toast.error('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        username,
        email,
        password,
        passwordConfirm
      });
      toast.success('¡Registro exitoso! Ya puedes iniciar sesión.');
      // console.log('Usuario registrado:', response.data);
      // Opcional: podrías limpiar el formulario o redirigir al login
      setUsername('');
      setEmail('');
      setPassword('');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error en el registro');
      console.error('Error al registrar usuario:', error.response?.data || error.message);
    } finally {
        setLoading(false);
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
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email" // Tipo email para validación automática del navegador
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu_email@ejemplo.com"
            required
            disabled={loading}
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
        <div className="form-group">
          <label htmlFor="passwordConfirm">Confirmar Contraseña:</label>
          <input
            type="password"
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Repite tu contraseña"
            required
            disabled={loading}
          />
        </div>

         <div className="form-group privacy-checkbox">
          <input
            type="checkbox"
            id="acceptPrivacyPolicy"
            checked={acceptPrivacyPolicy}
            onChange={(e) => setAcceptPrivacyPolicy(e.target.checked)}
            required // Esto hace que el checkbox sea obligatorio
          />
          <label htmlFor="acceptPrivacyPolicy">
            He leído y acepto la <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
          </label>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>      
        </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Register;