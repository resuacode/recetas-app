// utils/email.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Crear un transporter (configuración del servicio de email)
  const transporter = nodemailer.createTransport({
    host: process.env.MAILGUN_SMTP_SERVER,
    port: process.env.MAILGUN_SMTP_PORT,
    secure: false, // For port 587, typically use false (STARTTLS)
    auth: {
      user: process.env.MAILGUN_SMTP_LOGIN,
      pass: process.env.MAILGUN_SMTP_PASSWORD,
    },
    // Si estás en desarrollo y usando Nodemailer con Gmail, esto ayuda a evitar errores SELF_SIGNED_CERT_IN_CHAIN
    // ignoreTLS: true,
  });

  // 2) Definir las opciones del email
  const mailOptions = {
    from: 'Rescetario <noreply@mg.resuacode.es>', // Cambia esto al email verificado en Mailgun
    to: options.email,
    subject: options.subject,
    html: options.message,
    // text: options.message (opcional, versión de texto plano)
  };

  // 3) Enviar el email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;