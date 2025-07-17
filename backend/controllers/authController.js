// controllers/authController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Asegúrate de importar tu modelo de usuario
const sendEmail = require('../config/email'); // Importa la función de envío de email
const crypto = require('crypto'); // Módulo nativo de Node.js para generar tokens
const bcrypt = require('bcryptjs'); // Para hashear la nueva contraseña

// @desc Olvido la contraseña
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1. Obtener usuario por email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: 'No hay usuario con ese email.' });
  }

  // 2. Generar un token de restablecimiento seguro
  const resetToken = crypto.randomBytes(32).toString('hex'); // Genera un token aleatorio
  // Hashea el token antes de guardarlo en la BD (para que no sea legible si la BD es comprometida)
  const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedResetToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Expira en 15 minutos (15 * 60 segundos * 1000 milisegundos)

  await user.save({ validateBeforeSave: false }); // Guardar el token y expiración sin validar otros campos

  // 3. Crear URL de restablecimiento
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`; // Pasa el token NO HASHEADO al frontend

  const message = `Has solicitado restablecer tu contraseña. Haz clic en este enlace para hacerlo: ${resetURL}.\n\nEste enlace expirará en 15 minutos.\n\nSi no fuiste tú, por favor, ignora este correo.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Restablecimiento de Contraseña para Rescetario by dr.eats',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'El email de restablecimiento de contraseña ha sido enviado.'
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false }); // Limpiar tokens si falla el envío

    console.error('Error al enviar email de restablecimiento:', err); // Log para depuración
    return res.status(500).json({
      message: 'Hubo un error al enviar el email de restablecimiento. Inténtalo de nuevo más tarde.',
      error: err.message // Puedes quitar esto en producción
    });
  }
});


// @desc Restablecimiento de la contraseña
// @route POST /api/auth/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // 1. Obtener el token de la URL y hashearlo para comparar con la BD
  const hashedToken = crypto.createHash('sha256').update(req.query.token).digest('hex');

  // 2. Buscar usuario con ese token no expirado
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() } // $gt significa "greater than" (mayor que)
  });

  if (!user) {
    return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
  }

  // 3. Validar y actualizar la contraseña
  if (req.body.password !== req.body.passwordConfirm) {
    return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
  }

  // Hashear la nueva contraseña y guardarla
  user.password = req.body.password; // La contraseña se hasheará automáticamente por el pre-save hook en el modelo
  user.resetPasswordToken = undefined; // Limpiar el token
  user.resetPasswordExpires = undefined; // Limpiar la expiración

  await user.save(); // Guarda el usuario con la nueva contraseña y sin el token

  // 4. Iniciar sesión al usuario o enviarlo a la página de login (depende de tu flujo)
  // Para simplificar, aquí simplemente respondemos éxito.
  res.status(200).json({
    status: 'success',
    message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
  });
});

module.exports = { forgotPassword, resetPassword };