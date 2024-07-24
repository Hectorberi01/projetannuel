# Utiliser une image node officielle comme image de base
#FROM node:20

# Installer les dépendances système nécessaires
#RUN apt-get update && apt-get install -y \
#  build-essential \
#  libcairo2-dev \
#  libpango1.0-dev \
#  libjpeg-dev \
#  libgif-dev \
#  librsvg2-dev \
#  wget \
#  && wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O /cloud_sql_proxy \
#  && chmod +x /cloud_sql_proxy

# Définir le répertoire de travail
#WORKDIR /usr/src/app

# Copier package.json et package-lock.json
#COPY package*.json ./

# Installer les dépendances
#RUN npm install

# Copier le reste des fichiers de l'application
#COPY . .

# Compiler le code TypeScript
#RUN npm run build

# Exposer le port de l'application
#EXPOSE 8080

# Démarrer l'application
#CMD ["/bin/bash", "-c", "/cloud_sql_proxy -dir=/cloudsql -instances=sport-vision-428517:europe-west3:sportvision & npm run serve"]

# Utiliser une image Node.js officielle pour le build
FROM node:18 AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Construire l'application TypeScript
RUN npm run build

# Utiliser une image plus légère pour le runtime
FROM node:18-slim

# Installer les dépendances de production uniquement
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --production

# Copier les fichiers construits
COPY --from=builder /app/dist ./dist

# Exposer le port sur lequel l'application va fonctionner
EXPOSE 3000

# Commande pour lancer l'application
CMD ["node", "dist/index.js"]
