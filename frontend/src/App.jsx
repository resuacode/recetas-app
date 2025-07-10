import React, { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false); // Para alternar entre formularios
  
  console.log('App render - isLoggedIn:', isLoggedIn, 'currentUser:', currentUser);


  useEffect(() => {
        console.log('useEffect se ha ejecutado.');
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user'); 

    // Solo intenta parsear el usuario si 'user' no es null/undefined
    if (token && userString) {
      try {
        const parsedUser = JSON.parse(userString); // Intenta parsear el string a objeto
        console.log('Usuario parseado de localStorage:', parsedUser); // Ver si se parsea bien
        setCurrentUser(parsedUser); // Establece el usuario actual
        setIsLoggedIn(true); // Solo si el parseo es exitoso y hay token
      } catch (e) {
        // En caso de que el JSON no sea válido (p.ej., si fue corrompido)
        console.error("Error al parsear el JSON del usuario desde localStorage:", e);
        // Limpiar para evitar problemas futuros
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } else {
      console.log('No se encontró token o usuario en localStorage.');
    }
    // --- FIN CAMBIO ---
  }, []);

  const handleLoginSuccess = (token, user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setShowRegister(false);
  };

  const handleLogout = () => {
   console.log('Cerrando sesión.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <div className="app-container">
      <h1>Aplicación de Recetas</h1>

      {!isLoggedIn ? (
        <div className="auth-section">
          {showRegister ? (
            <>
              <Register />
              <p>¿Ya tienes cuenta? <button onClick={() => setShowRegister(false)}>Inicia Sesión</button></p>
            </>
          ) : (
            <>
              <Login onLoginSuccess={handleLoginSuccess} />
              <p>¿No tienes cuenta? <button onClick={() => setShowRegister(true)}>Regístrate aquí</button></p>
            </>
          )}
        </div>
      ) : (
        <div className="logged-in-section">
          <p>¡Hola, {currentUser}!</p>
          <button onClick={handleLogout}>Cerrar Sesión</button>
          <h2>¡Listado de Recetas Vendrá Aquí!</h2>
        </div>
      )}
    </div>
  );
}

export default App;