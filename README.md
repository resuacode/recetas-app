# Rescetario App

![Rescetario App Screenshot](./res/screenshot.png)

¡Bienvenido al repositorio de **Rescetario App**! Esta es una aplicación web completa diseñada para amantes de la cocina, donde puedes consultar, crear y gestionar tus recetas favoritas. La app ofrece una experiencia de usuario intuitiva para explorar una amplia variedad de platos y, para usuarios con rol de administrador, un robusto sistema de gestión de recetas personal.

---

## 📚 Tecnologías Utilizadas

Este proyecto se construye con una arquitectura **MERN Stack** (MongoDB, Express.js, React, Node.js), complementada con herramientas y servicios adicionales para un desarrollo y despliegue eficientes.

### Frontend
* **React**: Librería de JavaScript para construir interfaces de usuario interactivas.
* **Vite**: Un bundler de desarrollo rápido y ligero para React, optimizado para la producción.
* **React Router DOM**: Para la gestión del enrutamiento en el lado del cliente (Single Page Application - SPA).
* **Axios**: Cliente HTTP basado en promesas para realizar peticiones al backend.
* **React Hot Toast**: Librería para notificaciones de usuario (mensajes de éxito/error).
* **Sass (SCSS)**: Preprocesador CSS para escribir estilos más potentes y organizados.

### Backend
* **Node.js**: Entorno de ejecución de JavaScript.
* **Express.js**: Framework web para Node.js, utilizado para construir la API RESTful.
* **MongoDB**: Base de datos NoSQL flexible y escalable para almacenar los datos de las recetas y usuarios.
* **Mongoose**: ODM (Object Data Modeling) para MongoDB en Node.js, facilitando la interacción con la base de datos.
* **Express Async Handler**: Simplifica el manejo de errores en rutas asíncronas de Express.
* **JWT (JSON Web Tokens)**: Para la autenticación y autorización segura de usuarios.
* **Bcrypt.js**: Librería para el hashing seguro de contraseñas.
* **Dotenv**: Para cargar variables de entorno desde un archivo `.env`.
* **CORS**: Middleware para habilitar el Cross-Origin Resource Sharing.
* **Compression**: Middleware para la compresión de respuestas HTTP (Gzip/Brotli), optimizando la transferencia de datos.
* **Express Rate Limit**: Middleware para limitar el número de solicitudes por IP, protegiendo contra ataques de fuerza bruta.
* **Mailgun**: Servicio de envío de correos electrónicos transaccionales (utilizado para la recuperación de contraseña).
* **Docker**: Herramienta de contenerización para empaquetar el backend y sus dependencias, asegurando un entorno de ejecución consistente.

---

## 💡 Funcionalidades

### Funcionalidades Generales (Usuarios Anónimos y Registrados)
* **Registro de Usuarios**: Crea una nueva cuenta con nickname y correo electrónico. Incluye la aceptación de una **Política de Privacidad**.
* **Inicio de Sesión**: Accede a la aplicación con tus credenciales.
* **Recuperación de Contraseña**: Proceso seguro de restablecimiento de contraseña a través de un enlace enviado al correo electrónico (gestionado por Mailgun).
* **Navegación y Consulta de Recetas**:
    * **Ver todas las recetas**: Explora un listado completo de recetas disponibles para todos los usuarios.
    * **Ver detalle de receta**: Accede a la información detallada de cada receta (ingredientes, instrucciones, tiempos, etc.).

### Funcionalidades de Administración (Rol 'admin')
* **Gestión de Mis Recetas**: Los usuarios con rol `admin` pueden acceder a una sección exclusiva para gestionar **únicamente las recetas que ellos mismos han subido**.
    * **Crear Nueva Receta**: Añade nuevas recetas a la plataforma.
    * **Editar Receta**: Modifica los detalles de tus propias recetas existentes.
    * **Eliminar Receta**: Borra tus propias recetas de la base de datos.
* **Seguridad de Acceso**: La API asegura que solo el autor de una receta (o un super-administrador, si se implementara) pueda modificarla o eliminarla.

### Seguridad y Rendimiento
* **Rate Limiting**: Protección contra ataques de fuerza bruta en endpoints de autenticación y de API generales.
* **Compresión de Respuestas**: Las respuestas del servidor están comprimidas (Gzip/Brotli) para reducir el consumo de ancho de banda y mejorar la velocidad de carga.
* **Indexación de Base de Datos**: Índices aplicados en MongoDB para optimizar las consultas de búsqueda y filtrado.
* **Política de Privacidad**: Documento accesible desde el formulario de registro y con una ruta dedicada, detallando el tratamiento de datos personales conforme al RGPD.

---

## 🚀 Despliegue

La aplicación está desplegada en **Render.com**, utilizando su infraestructura para hosting de Static Sites y Web Services.

* **Frontend**: Desplegado como un **Static Site** en Render.
    * La carpeta `dist` generada por Vite contiene la aplicación React.
    * Las rutas dinámicas de la SPA (como `/forgot-password`, `/reset-password`, etc.) se manejan mediante reglas de **Reescritura (Rewrite)** configuradas directamente en el dashboard de Render (`/*` a `/index.html`), asegurando que el enrutamiento del lado del cliente funcione correctamente.
    * Dominio personalizado: `rescetario.resuacode.es`
* **Backend**: Desplegado como un **Web Service** en Render.
    * La API RESTful de Node.js/Express.js se ejecuta en el servidor dentro de un **contenedor Docker**.

---

## ⚙️ Configuración del Entorno Local

Para ejecutar el proyecto en tu máquina local, tienes dos opciones para el backend: directamente con Node.js o utilizando Docker.

### Prerequisitos
* Node.js (v18 o superior recomendado)
* npm (o Yarn/pnpm)
* MongoDB (local o una instancia remota como MongoDB Atlas)
* **Para Dockerized Backend:** Docker Desktop (o Docker Engine)

### Pasos Generales
1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/resuacode/recetas-app.git](https://github.com/resuacode/recetas-app.git)
    cd recetas-app
    ```

2.  **Configuración del Frontend:**
    * Navega a la carpeta `frontend`:
        ```bash
        cd frontend
        ```
    * Instala las dependencias:
        ```bash
        npm install
        ```
    * Crea un archivo `.env` en la raíz de la carpeta `frontend` con la siguiente variable de entorno:
        ```env
        VITE_API_BASE_URL=http://localhost:5000/api # Apunta a tu backend local
        ```
    * Inicia la aplicación React:
        ```bash
        npm run dev
        ```
        El frontend debería abrirse en `http://localhost:5173` (o un puerto similar).

### Configuración del Backend

#### Opción 1: Ejecutar el Backend Directamente con Node.js
* Navega a la carpeta `backend`:
    ```bash
    cd backend
    ```
* Instala las dependencias:
    ```bash
    npm install
    ```
* Crea un archivo `.env` en la raíz de la carpeta `backend` con las siguientes variables de entorno:
    ```env
    NODE_ENV=development
    PORT=5000
    MONGO_URI=tu_cadena_de_conexion_mongodb # Ej: mongodb+srv://user:pass@cluster.mongodb.net/recetario?retryWrites=true&w=majority
    JWT_SECRET=una_clave_secreta_fuerte_para_JWT
    JWT_EXPIRE=30d # Duración del token JWT
    MAILGUN_API_KEY=tu_api_key_de_mailgun
    MAILGUN_DOMAIN=tu_dominio_verificado_de_mailgun # Ej: mg.tudominio.com
    EMAIL_FROM=Recetario <noreply@tu_dominio.com> # Correo remitente
    FRONTEND_URL=http://localhost:5173 # O la URL de tu frontend en desarrollo
    ```
* Inicia el servidor:
    ```bash
    npm run dev
    ```
    El backend debería estar corriendo en `http://localhost:5000`.

#### Opción 2: Ejecutar el Backend con Docker
* Asegúrate de tener Docker Desktop o Docker Engine instalado y ejecutándose.
* Navega a la carpeta `backend`:
    ```bash
    cd backend
    ```
* Crea un archivo `.env` en la raíz de la carpeta `backend` con las mismas variables de entorno que en la Opción 1.
* Construye la imagen Docker:
    ```bash
    docker build -t recetario-backend .
    ```
* Ejecuta el contenedor Docker, mapeando el puerto 5000:
    ```bash
    docker run -p 5000:5000 --env-file ./.env recetario-backend
    ```
    El backend debería estar corriendo en `http://localhost:5000` dentro del contenedor.

---