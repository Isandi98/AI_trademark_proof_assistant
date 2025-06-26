# Usar imagen oficial de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Instalar servidor estático
RUN npm install -g serve

# Exponer puerto dinámico (Cloud Run proporciona $PORT)
EXPOSE $PORT

# Comando para ejecutar la aplicación usando la variable $PORT
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"] 