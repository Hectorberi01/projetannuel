# Utiliser une image node officielle comme image de base
FROM node:20

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
  build-essential \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  wget \
  && wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O /cloud_sql_proxy \
  && chmod +x /cloud_sql_proxy

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Compiler le code TypeScript
RUN node --max-old-space-size=2048 ./node_modules/typescript/bin/tsc

# Exposer le port de l'application
EXPOSE 8080

# Démarrer l'application
CMD ["sh", "-c", "/cloud_sql_proxy -dir=/cloudsql -instances=sport-vision-428517:europe-west3:sportvision & npm run serve"]
