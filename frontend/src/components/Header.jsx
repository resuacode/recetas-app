// frontend/src/components/Header.jsx
import React from 'react';

const Header = ({ isLoggedIn, username, onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        {/* Puedes añadir un logo o algo aquí si quieres */}
      </div>
      <div className="header-center">
        <h1>Rescetario by dr.eats</h1>
      </div>
      <div className="header-right">
        {isLoggedIn ? (
          <div className="user-info">
            <span>Logueado como: <strong>{username}</strong></span>
            <button onClick={onLogout} className="logout-button">Cerrar Sesión</button>
          </div>
        ) : (
          // Opcional: Puedes poner un mensaje o dejarlo vacío si no está logueado
          <span></span>
        )}
      </div>
    </header>
  );
};

export default Header;