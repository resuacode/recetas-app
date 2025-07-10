# Usar una imagen base de Node.js ligera
FROM node:20-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json (o yarn.lock) para instalar dependencias
# Esto es crucial para aprovechar el cache de Docker y acelerar las builds
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código de la aplicación al contenedor
COPY . .

# Exponer el puerto en el que la aplicación Express escucha
EXPOSE 5000

# Comando para iniciar la aplicación cuando el contenedor se ejecuta
CMD ["node", "server.js"]