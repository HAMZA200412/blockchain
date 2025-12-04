# Étape 1 : Construire l'image
FROM node:18-slim

# Répertoire de travail
WORKDIR /app

# Copier uniquement package.json + lock pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste de l'application
COPY . .

# Exposer le port Vite
EXPOSE 3000

# Commande de démarrage (mode développement)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
