// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Register from './components/Register';
import Login from './components/Login';
import RecipeList from './components/RecipeList'; // Importa el nuevo componente
import './App.css'; // Asegúrate de tener este archivo para los estilos

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // console.log('App render - isLoggedIn:', isLoggedIn, 'currentUser:', currentUser); // Puedes quitar este log ahora si quieres

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
      try {
        const parsedUser = JSON.parse(userString);
        // console.log('Usuario parseado de localStorage:', parsedUser); // Puedes quitar este log
        setCurrentUser(parsedUser);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Error al parsear el JSON del usuario desde localStorage:", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    }
  }, []);

  const handleLoginSuccess = (token, user) => {
    // console.log('handleLoginSuccess llamado. Usuario recibido:', user); // Puedes quitar este log
    setIsLoggedIn(true);
    setCurrentUser(user);
    setShowRegister(false);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
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
      {/* Header siempre visible */}
      <Header
        isLoggedIn={isLoggedIn}
        username={currentUser}
        onLogout={handleLogout}
      />

      {/* Contenido principal que cambia según el estado de login */}
      <main className="app-main-content">
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
          // Si está logueado, muestra el componente RecipeList
          <RecipeList />
        )}
      </main>

      {/* Footer siempre visible */}
      <Footer />
    </div>
  );
}

export default App;