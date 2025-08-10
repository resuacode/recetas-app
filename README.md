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
* **MongoDB**: Base de datos NoSQL flexible y escalable para almacenar los datos de las recetas, usuarios y favoritos.
* **Mongoose**: ODM (Object Data Modeling) para MongoDB en Node.js, facilitando la interacción con la base de datos y gestión de relaciones como favoritos de usuarios.
* **Express Async Handler**: Simplifica el manejo de errores en rutas asíncronas de Express.
* **JWT (JSON Web Tokens)**: Para la autenticación y autorización segura de usuarios.
* **Bcrypt.js**: Librería para el hashing seguro de contraseñas.
* **Dotenv**: Para cargar variables de entorno desde un archivo `.env`.
* **CORS**: Middleware para habilitar el Cross-Origin Resource Sharing.
* **Compression**: Middleware para la compresión de respuestas HTTP (Gzip/Brotli), optimizando la transferencia de datos.
* **Express Rate Limit**: Middleware para limitar el número de solicitudes por IP, protegiendo contra ataques de fuerza bruta.
* **Mailgun**: Servicio de envío de correos electrónicos transaccionales (utilizado para la recuperación de contraseña).
* **Docker**: Herramienta de contenerización para empaquetar el backend y sus dependencias, asegurando un entorno de ejecución consistente.

### Servicios Externos
* **Cloudinary**: Servicio de gestión y optimización de imágenes en la nube, utilizado para el almacenamiento y procesamiento de imágenes de recetas.
* **Mailgun**: Plataforma de envío de correos electrónicos transaccionales para funcionalidades de recuperación de contraseña.

### Arquitectura y Patrones
* **Arquitectura RESTful**: API bien estructurada siguiendo principios REST para operaciones CRUD.
* **Interceptores de Axios**: Centralización del manejo de autenticación y manejo de errores HTTP.
* **Validación en ambos extremos**: Validación tanto en frontend (UX inmediata) como en backend (seguridad).
* **Gestión de estado local**: Uso eficiente del estado de React para una experiencia de usuario fluida.
* **Responsive Design**: Diseño adaptativo con SCSS y CSS Grid para óptima experiencia en móviles y escritorio.

---

## 💡 Funcionalidades

### Funcionalidades Generales (Usuarios Anónimos y Registrados)
* **Acceso Público a Recetas**: Los usuarios no registrados pueden explorar y consultar toda la biblioteca de recetas sin necesidad de crear una cuenta.
* **Registro de Usuarios**: Crea una nueva cuenta con nickname y correo electrónico. Incluye la aceptación de una **Política de Privacidad**.
* **Inicio de Sesión**: Accede a la aplicación con tus credenciales.
* **Recuperación de Contraseña**: Proceso seguro de restablecimiento de contraseña a través de un enlace enviado al correo electrónico (gestionado por Mailgun).
* **Navegación y Consulta de Recetas**:
    * **Ver todas las recetas**: Explora un listado completo de recetas disponibles para todos los usuarios (registrados y anónimos).
    * **Ver detalle de receta**: Accede a la información detallada de cada receta (ingredientes, instrucciones, tiempos, etc.).
    * **Búsqueda y Filtrado Avanzado**:
        - **Búsqueda por título**: Encuentra recetas por nombre o palabras clave.
        - **Filtro por categorías**: Dropdown con autocompletado para seleccionar múltiples categorías.
        - **Filtro por autor**: Busca recetas de usuarios específicos.
        - **Filtro por favoritos**: Solo para usuarios registrados, muestra únicamente las recetas marcadas como favoritas.
        - **Ordenación flexible**: Por fecha de creación, título, autor, etc. (ascendente/descendente).
        - **Paginación configurable**: 10, 20 o 50 recetas por página.
    * **Ingredientes con formato avanzado**: Visualización inteligente de cantidades en formato de fracciones, decimales y números mixtos.

### Funcionalidades Exclusivas para Usuarios Registrados
* **Sistema de Favoritos**: 
    * **Marcar/desmarcar favoritos**: Añade o quita recetas de tu lista personal de favoritos con un simple clic en el ícono de corazón.
    * **Filtrado por favoritos**: Usa el filtro "Solo mis favoritos ❤️" para ver únicamente tus recetas guardadas.
    * **Sincronización en tiempo real**: Los cambios en favoritos se reflejan inmediatamente en todos los filtros y vistas.
    * **Persistencia**: Tus favoritos se guardan en tu perfil y están disponibles desde cualquier dispositivo al iniciar sesión.
* **Acceso a funcionalidades premium**: Los usuarios registrados disfrutan de una experiencia completa con todas las herramientas de personalización.

### Funcionalidades de Administración (Rol 'admin')
* **Gestión de Mis Recetas**: Los usuarios con rol `admin` pueden acceder a una sección exclusiva para gestionar **únicamente las recetas que ellos mismos han subido**.
    * **Crear Nueva Receta**: Añade nuevas recetas a la plataforma con las siguientes características:
        - **Subida de imágenes**: Integración con Cloudinary para almacenamiento de imágenes optimizado.
        - **Ingredientes flexibles**: Cantidades opcionales que admiten números decimales (1.5), fracciones (1/2) y números mixtos (1 1/2).
        - **Reordenación de ingredientes**: Mover ingredientes hacia arriba o abajo en la lista.
        - **Diseño responsive**: Formulario optimizado para dispositivos móviles con layout de dos filas para ingredientes.
        - **Validación robusta**: Validación en tiempo real de formatos de cantidad y campos obligatorios.
    * **Editar Receta**: Modifica los detalles de tus propias recetas existentes.
    * **Eliminar Receta**: Borra tus propias recetas de la base de datos.
* **Seguridad de Acceso**: La API asegura que solo el autor de una receta (o un super-administrador, si se implementara) pueda modificarla o eliminarla.

### Autenticación y Gestión de Sesiones
* **Gestión automática de tokens**: Sistema centralizado con interceptores de Axios para manejo transparente de autenticación.
* **Validación de sesión**: Detección automática de tokens expirados al cargar la aplicación.
* **Renovación de tokens**: Endpoint de refresh para mantener sesiones activas sin interrupciones.
* **Redirección automática**: Redirige automáticamente al login cuando la sesión expira, con notificaciones informativas.
* **Experiencia de usuario mejorada**: Eliminación de errores sorpresa y logout manual innecesario.

### Seguridad y Rendimiento
* **Rate Limiting**: Protección contra ataques de fuerza bruta en endpoints de autenticación y de API generales.
* **Compresión de Respuestas**: Las respuestas del servidor están comprimidas (Gzip/Brotli) para reducir el consumo de ancho de banda y mejorar la velocidad de carga.
* **Indexación de Base de Datos**: Índices aplicados en MongoDB para optimizar las consultas de búsqueda y filtrado.
* **Política de Privacidad**: Documento accesible desde el formulario de registro y con una ruta dedicada, detallando el tratamiento de datos personales conforme al RGPD.
* **Filtrado en cliente**: Mejora del rendimiento al procesar filtros y ordenación en el frontend, reduciendo la carga del servidor.

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
    git clone https://github.com/resuacode/recetas-app.git
    cd recetas-app
    ```

2.  **Configuración de Variables de Entorno para Docker:**
    * Copia el archivo de ejemplo de variables de entorno:
        ```bash
        cp .env.example .env
        ```
    * Edita el archivo `.env` y configura las credenciales de MongoDB:
        ```env
        MONGO_ROOT_USERNAME=tu_usuario_mongo
        MONGO_ROOT_PASSWORD=tu_password_mongo_seguro
        ```
    * **⚠️ Importante:** El archivo `.env` no se sube al repositorio por seguridad. Cada desarrollador debe configurar su propio archivo local.

3.  **Configuración del Frontend:**
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

### Opción 3: Ejecutar con Docker Compose (Recomendado para Desarrollo)
* Desde la raíz del proyecto, donde está el archivo `docker-compose.yml`:
    ```bash
    docker-compose up -d
    ```
    Esto iniciará tanto MongoDB como el backend en contenedores separados, con la base de datos persistente en un volumen Docker.

---

## 🔧 Mejoras y Desarrollo Reciente

### Funcionalidades Implementadas Recientemente
* **Acceso público a recetas**: Los usuarios no registrados ahora pueden explorar y consultar toda la biblioteca de recetas sin necesidad de registrarse, fomentando el descubrimiento de contenido antes del registro.
* **Sistema completo de favoritos**: Implementación de funcionalidad para marcar/desmarcar recetas como favoritas, con botones integrados en tarjetas y vistas de detalle, filtrado específico y sincronización en tiempo real.
* **Estrategia de conversión freemium**: Los usuarios anónimos pueden ver todas las recetas, pero necesitan registrarse para acceder a funcionalidades premium como favoritos, creando un incentivo natural para el registro.
* **Sistema de autenticación robusto**: Implementación de interceptores automáticos para manejo de tokens JWT, eliminando la necesidad de configuración manual en cada petición HTTP.
* **Gestión inteligente de ingredientes**: Soporte para cantidades en formato de fracciones, decimales y números mixtos, con validación automática.
* **Interfaz móvil mejorada**: Layout optimizado para ingredientes en dispositivos móviles con disposición de dos filas (nombre en primera fila, cantidad y unidad en segunda).
* **Sistema de filtrado avanzado**: Dropdown de categorías con autocompletado, búsqueda por título y autor, con procesamiento en cliente para mejor rendimiento.
* **Reordenación de ingredientes**: Funcionalidad para mover ingredientes hacia arriba y abajo en formularios de recetas.
* **Integración con Cloudinary**: Subida optimizada de imágenes con validación de formato y tamaño.

### Arquitectura de Desarrollo
* **Gestión centralizada de autenticación**: Archivo `utils/auth.js` con interceptores de Axios para manejo automático de tokens y redirecciones.
* **Sistema de favoritos escalable**: API RESTful completa para gestión de favoritos con endpoints protegidos y sincronización en tiempo real entre componentes.
* **Estrategia de acceso gradual**: Arquitectura que permite acceso público a contenido con funcionalidades premium para usuarios registrados.
* **Validación robusta**: Sistema de validación tanto en frontend como backend, con mensajes de error específicos y UX mejorada.
* **Código mantenible**: Eliminación de código duplicado para manejo de autenticación en componentes individuales.
* **Responsive design**: Uso de SCSS modular con mixins y variables para diseño adaptativo consistente.

### Flujo de Autenticación Mejorado
1. **Validación automática**: Al cargar la aplicación, se valida automáticamente la sesión del usuario.
2. **Manejo transparente**: Las peticiones HTTP incluyen automáticamente los headers de autenticación.
3. **Renovación inteligente**: Sistema preparado para renovación automática de tokens antes de que expiren.
4. **UX sin interrupciones**: Los usuarios son notificados y redirigidos suavemente cuando la sesión expira.

---
