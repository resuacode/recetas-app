// frontend/src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const githubUrl = "https://github.com/resuacode"; // ¡CAMBIA ESTO!
  const instagramUrl = "https://instagram.com/dr.eats32"; // ¡CAMBIA ESTO!
  const tiktokUrl = "https://tiktok.com/@dr.eats32"; // ¡CAMBIA ESTO!

  return (
    <footer className="app-footer">
      <p>&copy; {currentYear} Rescetario by dr.eats</p>
      <p>
        Made using: React, Node.js, Express, MongoDB, Docker
      </p>
      <div className="social-links">
        <a href={githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a> | {" "}
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a> | {" "}
        <a href={tiktokUrl} target="_blank" rel="noopener noreferrer">TikTok</a>
      </div>
    </footer>
  );
};

export default Footer;