// frontend/src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams(); // Hook para obtener query params
  const navigate = useNavigate();

  const token = searchParams.get('token'); // Obtiene el token de la URL

  useEffect(() => {
    if (!token) {
      setError('Token de restablecimiento no encontrado en la URL.');
      toast.error('Token de restablecimiento no válido o no encontrado.');
      // Opcional: Redirigir después de un tiempo
      setTimeout(() => navigate('/forgot-password'), 5000);
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (!token) {
        setError('No se pudo procesar la solicitud: token ausente.');
        setLoading(false);
        return;
    }

    try {
      const response = await axios.patch(`${API_URL}/auth/reset-password?token=${token}`, {
        password,
        passwordConfirm
      });
      toast.success(response.data.message);
      // Redirige al usuario al login después de un restablecimiento exitoso
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña. Inténtalo de nuevo.');
      toast.error(err.response?.data?.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) { // Muestra un mensaje mientras se verifica o si no hay token al cargar
    return <p className="loading-message">Verificando token...</p>;
  }

  if (error && token === null) { // Si el error es específicamente por token ausente
    return (
        <div className="error-container">
            <p className="error-message">{error}</p>
            <Link to="/forgot-password" className="button">Solicitar un nuevo enlace</Link>
        </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Establecer Nueva Contraseña</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">Nueva Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            minLength="6"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="passwordConfirm">Confirmar Nueva Contraseña</label>
          <input
            type="password"
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="********"
            required
            minLength="6"
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;