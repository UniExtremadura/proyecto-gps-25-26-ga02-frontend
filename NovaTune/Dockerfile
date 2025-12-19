# Frontend Dockerfile

# Usamos Node.js
FROM node:22-alpine

WORKDIR /app

# Copiamos package.json primero para aprovechar la caché
COPY package.json package-lock.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY .. .

# Exponemos el puerto de Vite
EXPOSE 5173

# Arrancamos en modo desarrollo expuesto a la red
CMD ["npm", "run", "dev", "--", "--host"]