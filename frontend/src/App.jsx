// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Importa Router, Routes, Route, Navigate
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import Footer from './components/Footer';
import Register from './components/Register';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail'; 
import RecipeManagement from './components/RecipeManagement';
import RecipeForm from './components/RecipeForm';
import './App.scss'; // Asegúrate de tener este archivo para los estilos

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // console.log('App render - isLoggedIn:', isLoggedIn, 'currentUser:', currentUser); // Puedes quitar este log ahora si quieres

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const roleString = localStorage.getItem('role');

    if (token && userString && roleString) {
      try {
        const parsedUser = JSON.parse(userString);
        const parsedRole = JSON.parse(roleString);
        // console.log('Usuario parseado de localStorage:', parsedUser); // Puedes quitar este log
        setCurrentUser(parsedUser);
        setIsLoggedIn(true);
        setUserRole(parsedRole);
      } catch (e) {
        console.error("Error al parsear el JSON del usuario desde localStorage:", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUserRole(null);
      }
    }
  }, []);

  const handleLoginSuccess = (token, user, role) => {
    // console.log('handleLoginSuccess llamado. Usuario recibido:', user); // Puedes quitar este log
    setIsLoggedIn(true);
    setCurrentUser(user);
    setUserRole(role);
    setShowRegister(false);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', JSON.stringify(role)); // Guarda el rol del usuario
  };

  const handleLogout = () => {
    console.log('Cerrando sesión.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role'); // Elimina el rol del usuario
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole(null);
    window.location.href = '/'; // Recarga la página y va a la raíz
  };

  return (
     <Router>
      <Toaster // Coloca el Toaster aquí. Puedes añadirle props como position="top-right"
        position="bottom-center" // Opciones: "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"
        reverseOrder={false} // Para que los toasts más nuevos aparezcan arriba
        toastOptions={{
          // Default options for specific toast types
          success: {
            duration: 3000,
            style: {
              background: '#28a745', // Verde para éxito
              color: '#fff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#dc3545', // Rojo para error
              color: '#fff',
            },
          },
          // Puedes añadir estilos generales aquí o por tipo
          style: {
            fontSize: '1rem',
            padding: '16px',
            borderRadius: '8px',
          },
        }}
      />
      <div className="app-container">
        {/* Header siempre visible */}
        <Header
          isLoggedIn={isLoggedIn}
          username={currentUser}
          userRole={userRole}
          onLogout={handleLogout}
        />

        {/* Contenido principal que cambia según el estado de login */}
        <main className="app-main-content">
          <Routes>
            <Route
              path="/"
              element={
                !isLoggedIn ? (
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
                  <RecipeList /> // Si está logueado, muestra RecipeList
                )
              }
            />
            {/* Ruta para la política de privacidad */}
            <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} /> 
            {/* La ruta para el formulario de olvidó la contraseña */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* La ruta para restablecer contraseña debe aceptar el token como query param */}
            <Route path="/reset-password" element={<ResetPassword />} /> 
            {/* Ruta para la vista de detalle de la receta */}
            <Route
              path="/recipes/:id"
              element={isLoggedIn ? <RecipeDetail /> : <Navigate to="/" replace />}
            />
             {/* Ruta para Gestión de Recetas */}
            <Route
              path="/manage-recipes"
              element={
                isLoggedIn && userRole === 'admin' ? ( // Protegido por login y rol 'admin'
                  <RecipeManagement currentUser={currentUser} /> // Pasa el usuario actual
                ) : (
                  <Navigate to="/" replace /> // Redirige si no es admin o no está logueado
                )
              }
            />
            {/* Ruta para crear una nueva Receta */}
            <Route
              path="/manage-recipes/new"
              element={
                isLoggedIn && userRole === 'admin' ? (
                  <RecipeForm type="create" />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* ¡Nueva ruta para editar receta! */}
            <Route
              path="/manage-recipes/edit/:id"
              element={
                isLoggedIn && userRole === 'admin' ? (
                  <RecipeForm type="edit" />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* Opcional: Ruta por defecto para 404 o redirección */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer siempre visible */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;