// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setMessage(response.data.message);
      toast.success(response.data.message);
      setEmail(''); // Limpiar el campo de email
    } catch (err) {
      setError(err.response?.data?.message || 'Error al solicitar el restablecimiento. Inténtalo de nuevo.');
      toast.error(err.response?.data?.message || 'Error al solicitar el restablecimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container"> {/* Usa tus propias clases de estilo */}
      <h2>Recuperar Contraseña</h2>
      <p>Introduce tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu_email@ejemplo.com"
            required
            disabled={loading}
          />
        </div>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
        </button>
      </form>
      <div className="form-links">
        <Link to="/login">Volver al inicio de sesión</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;