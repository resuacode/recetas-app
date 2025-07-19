// frontend/src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ isLoggedIn, username, userRole, onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        {/* Puedes añadir un logo o algo aquí si quieres */}
      </div>
      <div className="header-center">
        <Link to="/" className="app-title-link"> {/* Enlaza el título a la raíz */}
            <h1>Rescetario by dr.eats</h1>
        </Link>
      </div>
      <div className="header-right">
        {isLoggedIn ? (
          <div className="user-info">
            <span>¡Hola <strong>{username}</strong>!</span>
            {userRole === 'admin' && ( // Muestra el botón solo si el rol es 'admin'
              <Link to="/manage-recipes" className="manage-recipes-button">
                Mis Recetas
              </Link>
            )}
            <button onClick={onLogout} className="logout-button">Logout</button>
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