# Truegather - Frontend

Bienvenue dans la partie **Frontend** du projet Truegather ! ✨
Ce projet est construit avec **Vue 3** et **Nuxt 3**. Ce document est conçu pour vous guider pas à pas, même (et surtout) si vous êtes débutant en développement web moderne.

## 🛠 Prérequis

Afin de pouvoir lancer l'application sur votre PC, vous devez installer :
1. **[Node.js](https://nodejs.org/)** (Version 20 recommandée) : L'environnement pour exécuter JavaScript hors du navigateur.
2. **[npm](https://www.npmjs.com/)** : Le gestionnaire de paquets (fourni avec Node.js).
3. **[Docker](https://docs.docker.com/get-docker/)** *(Optionnel)* : Si vous souhaitez tester l'image de production.

## 🚀 Démarrage rapide (Développement Local)

Le développement sur Nuxt 3 est extrêmement fluide. Il recharge la page de lui-même (Hot Module Replacement) dès que vous sauvegardez un fichier.

### 1. Installer les dépendances
Ouvrez votre terminal dans le dossier `frontend` et tapez :
```bash
npm install
```
*Cela va lire le fichier `package.json` et télécharger tout ce dont le projet a besoin dans un dossier `node_modules`.*

### 2. Démarrer le serveur de développement
Une fois l'installation terminée :
```bash
npm run dev
```
Rendez-vous ensuite sur **[http://localhost:3000](http://localhost:3000)** dans votre navigateur. Le serveur se mettra à jour en temps réel lors de vos modifications ! 🪄

---

## 🏗 Architecture et Fichiers Clés

Voici comment le code est organisé pour vous y retrouver facilement :

- `nuxt.config.ts` : Le cœur de l'application Nuxt. C'est ici que l'on configure les modules, l'environnement, le SEO par défaut, etc.
- `app/` ou la racine : Contient souvent le point d'entrée `app.vue`.
- `pages/` *(si applicable)* : Le routeur automatique de Nuxt. Chaque fichier `.vue` ici devient une vraie page web (ex: `pages/about.vue` -> `/about`).
- `components/` *(si applicable)* : Vos composants réutilisables (Ex: Boutons, Modales). Nuxt les importe automatiquement sans même avoir besoin de faire un `import`.
- `public/` : Les ressources statiques (images, `robots.txt`, `favicon.ico`) qui ne seront pas touchées par Nuxt.
- `.github/workflows/ci-cd.yml` : Le fichier de configuration d'intégration/déploiement continu.
- `Dockerfile` : Les instructions pour créer une "boîte de production" (Image).

---

## 🐳 Déploiement et Dockerfile

Quand vient le moment de mettre l'application en ligne, on n'utilise pas `npm run dev` car ce n'est pas optimisé. On utilise **Docker** pour packager l'application "prête pour la production".

Notre fichier `Dockerfile` fait cela en 2 étapes pour être léger :
1. **Étape 1 (Build)** : Il télécharge les dépendances (`npm install`) et compile notre application en fichiers statiques optimisés avec la commande interne de Nuxt (`npm run build`).
2. **Étape 2 (Runtime)** : Il prend le résultat très léger de cette compilation et l'embarque dans un tout petit serveur Node.js ou un serveur statique (Nginx).

Pour tester cela localement :
```bash
# Construire l'image (cela exécute npm run build dans Docker)
docker build -t truegather-frontend .

# Lancer le serveur de production
docker run -p 3000:3000 truegather-frontend
```

---

## 🤖 CI / CD (Intégration et Déploiement Continus)

Le dossier `.github/workflows/ci-cd.yml` de la partie front suit exactement la même philosophie que le backend. C'est un robot qui observe vos actions.

Dès que vous envoyez votre code sur la branche `main` (sur GitHub) :
1. **GitHub vérifie et compile** : Il lance un environnement Linux, installe Node.js 20, télécharge vos paquets en cache, et lance `npm run build`.
2. **Construction de l'Image** : Si la compilation réussit sans erreur, il lit automatiquement le `Dockerfile` et se connecte à notre compte **DockerHub** à l'aide de secrets sécurisés (mots de passe configurés sur GitHub).
3. **Publication** : Il envoie la nouvelle version fraîche de l'image (taggée `latest`) afin qu'un serveur puisse l'utiliser pour mettre à jour le site final.

---

## 💡 Commandes Utiles au quotidien

- Lancer le projet : `npm run dev`
- Mettre à jour des paquets (si vous modifiez `package.json`) : `npm install`
- Tester la compilation de prod chez vous pour débugger : `npm run build` puis `npm run preview`

Bons développements ! 🎨
