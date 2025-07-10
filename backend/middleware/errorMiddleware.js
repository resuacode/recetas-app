// backend/middleware/errorMiddleware.js
const notFound = (req, res, next) => {
  const error = new Error(`No Encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pasa el error al siguiente middleware (errorHandler)
};

const errorHandler = (err, req, res, next) => {
  // Si el status code es 200 (OK) pero hubo un error, lo cambiamos a 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Muestra el stack solo en desarrollo
  });
};

module.exports = { notFound, errorHandler };