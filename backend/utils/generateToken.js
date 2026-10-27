// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

const TOKEN_EXPIRES_IN = '1h'; // Vida de cada token
const MAX_SESSION_SECONDS = 7 * 24 * 60 * 60; // Vida máxima de la sesión desde el login (7 días)

// authTime: momento del login original (segundos). Se conserva en cada renovación
// para que la sesión no pueda extenderse indefinidamente.
const generateToken = (id, authTime = Math.floor(Date.now() / 1000)) => {
  return jwt.sign({ id, authTime }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
};

module.exports = { generateToken, MAX_SESSION_SECONDS };
