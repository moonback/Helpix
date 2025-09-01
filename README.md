# 🤝 Entraide Universelle

**Une plateforme d'entraide géolocalisée qui connecte les communautés pour échanger temps, compétences et services dans une économie de proximité collaborative.**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.38.5-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-blue.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 À Propos

Entraide Universelle est une application web progressive qui révolutionne l'entraide de proximité en permettant aux utilisateurs de :

- **Proposer** leurs compétences et services à leur communauté locale
- **Demander** de l'aide pour leurs besoins quotidiens
- **Échanger** dans une économie de crédits équitable et transparente
- **Se connecter** avec des personnes près de chez eux grâce à la géolocalisation

L'application favorise la solidarité, renforce les liens sociaux et crée un écosystème d'entraide durable.

## ✨ Fonctionnalités Principales

### 🔐 **Authentification & Profils**
- Inscription/connexion sécurisée avec Supabase Auth
- Profils utilisateurs personnalisables avec compétences et objets
- Landing page pour les utilisateurs non-connectés
- Onboarding interactif pour nouveaux utilisateurs

### 📱 **Interface Mobile-First**
- Design responsive optimisé pour tous appareils
- Navigation intuitive avec barre de navigation mobile
- Animations fluides avec Framer Motion
- Mode sombre/clair (planifié)

### 🌍 **Géolocalisation Intelligente**
- Détection automatique de position avec fallbacks multiples
- Géocodage inverse avec services multiples (Nominatim, BigDataCloud, LocationIQ)
- Tri des tâches par proximité géographique
- Carte interactive avec Leaflet et OpenStreetMap

### 🎯 **Gestion des Tâches Avancée**
- CRUD complet des tâches avec validation
- Système de statuts étendus (open, in_progress, completed, cancelled, on_hold, review)
- Suivi de progression avec pourcentages et étapes
- Système de priorités et complexité
- Filtres et recherche avancée
- Gestion des dépendances et sous-tâches

### 💬 **Messagerie Temps Réel**
- Chat complet avec interface moderne
- Support messages texte, images et fichiers
- Design glassmorphism avec animations
- Gestion des conversations et participants
- Statuts de lecture et historique

### 💰 **Système de Crédits Payant**
- Portefeuille numérique avec transactions sécurisées
- Achat de crédits avec packages prédéfinis
- Débit automatique lors de la création de tâches
- Gains de crédits pour l'aide apportée
- Système de retraits et paiements

### 📊 **Tableau de Bord Analytique**
- Métriques de performance en temps réel
- Vues multiples : Vue d'ensemble, Toutes les tâches, Analytics
- Filtres avancés par statut, priorité, complexité
- Tri intelligent par différents critères
- Statistiques de completion et efficacité

## 🛠️ Stack Technique

### **Frontend**
- **React 18** - Framework UI avec concurrent features
- **TypeScript 5.2** - Typage statique strict
- **Vite 5.0** - Build tool ultra-rapide
- **Tailwind CSS 3.3** - Framework CSS utility-first
- **Framer Motion 10.16** - Animations fluides
- **React Router 6.20** - Navigation SPA
- **Zustand 4.4** - Gestion d'état légère
- **React Leaflet 4.2** - Cartes interactives
- **Recharts 3.1** - Graphiques et visualisations

### **Backend & Base de Données**
- **Supabase 2.38** - Backend-as-a-Service
- **PostgreSQL 15+** - Base de données relationnelle
- **Row Level Security (RLS)** - Sécurité au niveau des lignes
- **Real-time Subscriptions** - Synchronisation temps réel
- **Supabase Auth** - Authentification sécurisée
- **Supabase Storage** - Stockage de fichiers

### **Services Externes**
- **Nominatim** - Géocodage inverse OpenStreetMap
- **BigDataCloud** - API de géolocalisation
- **LocationIQ** - Service de géocodage alternatif
- **OpenStreetMap** - Tiles de cartes

### **Outils de Développement**
- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Formatage de code
- **Jest** - Tests unitaires
- **Testing Library** - Tests de composants React
- **Husky** - Git hooks (planifié)

## 📋 Prérequis

### **Développement Local**
- **Node.js** 18+ (recommandé : 20.x LTS)
- **npm** 9+ ou **yarn** 1.22+
- **Git** 2.30+

### **Services Externes**
- **Compte Supabase** (gratuit)
- **Clé API Nominatim** (gratuite, optionnelle)
- **Clé API BigDataCloud** (gratuite, optionnelle)
- **Clé API LocationIQ** (gratuite, optionnelle)

## 🚀 Installation & Configuration

### **1. Cloner le Projet**

```bash
git clone https://github.com/votre-username/entraide-universelle.git
cd entraide-universelle
```

### **2. Installer les Dépendances**

```bash
npm install
# ou
yarn install
```

### **3. Configuration Supabase**

#### **A. Créer un Projet Supabase**
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé anonyme

#### **B. Configurer la Base de Données**
Exécuter les scripts SQL dans l'ordre :

```bash
# 1. Structure de base
psql -h your-db-host -U postgres -d postgres -f docs/CREER_STRUCTURE_WALLET.sql

# 2. Système de crédits
psql -h your-db-host -U postgres -d postgres -f docs/CREATE_CREDIT_TABLES.sql

# 3. Messagerie
psql -h your-db-host -U postgres -d postgres -f docs/CREER_STRUCTURE_MESSAGERIE.sql

# 4. Politiques RLS
psql -h your-db-host -U postgres -d postgres -f docs/CREER_POLITIQUES_RLS_OFFRES.sql
```

#### **C. Configurer l'Authentification**
1. **Authentication > Settings** dans Supabase
2. Activer "Enable email confirmations" (recommandé)
3. Configurer les URLs de redirection :
   - Site URL: `http://localhost:5173` (dev)
   - Redirect URLs: `http://localhost:5173/**` (dev)

### **4. Variables d'Environnement**

Créer un fichier `.env.local` :

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Géolocalisation (optionnel)
VITE_NOMINATIM_URL=https://nominatim.openstreetmap.org
VITE_BIGDATACLOUD_API_KEY=your-bigdatacloud-key
VITE_LOCATIONIQ_API_KEY=your-locationiq-key

# Cartes
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Analytics (optionnel)
VITE_ANALYTICS_ID=your-analytics-id
```

### **5. Lancement de l'Application**

#### **Mode Développement**
```bash
npm run dev
# ou
yarn dev
```
→ Application accessible sur `http://localhost:5173`

#### **Build Production**
```bash
npm run build
# ou
yarn build
```

#### **Preview Build**
```bash
npm run preview
# ou
yarn preview
```

## 🗂️ Structure du Projet

```
entraide-universelle/
├── src/
│   ├── components/           # Composants UI réutilisables
│   │   ├── ui/              # Composants de base (Button, Input, Card...)
│   │   ├── chat/            # Composants messagerie
│   │   ├── layout/          # Layout et navigation
│   │   └── navigation/      # Navigation mobile
│   ├── features/            # Fonctionnalités par domaine
│   │   ├── auth/           # Authentification & onboarding
│   │   ├── landing/        # Page d'accueil publique
│   │   ├── home/           # Page d'accueil connectée
│   │   ├── dashboard/      # Tableau de bord analytique
│   │   ├── add/            # Création de tâches
│   │   ├── edit/           # Édition de tâches
│   │   ├── task-detail/    # Détails d'une tâche
│   │   ├── map/            # Carte interactive
│   │   ├── chat/           # Messagerie
│   │   ├── profile/        # Profil utilisateur
│   │   ├── wallet/         # Portefeuille et crédits
│   │   └── help-offers/    # Offres d'aide
│   ├── hooks/               # Hooks personnalisés
│   │   ├── useAuth.ts      # Gestion authentification
│   │   ├── useGeolocation.ts # Géolocalisation avec fallbacks
│   │   ├── useReverseGeocoding.ts # Géocodage inverse
│   │   └── useRealtimeMessages.ts # Messages temps réel
│   ├── stores/              # Stores Zustand
│   │   ├── authStore.ts    # État authentification
│   │   ├── taskStore.ts    # État des tâches
│   │   ├── messageStore.ts # État des messages
│   │   ├── helpOfferStore.ts # État des offres d'aide
│   │   └── walletStore.ts  # État du portefeuille
│   ├── lib/                 # Utilitaires et configurations
│   │   ├── supabase.ts     # Client Supabase
│   │   ├── router.ts       # Configuration routing
│   │   ├── utils.ts        # Fonctions utilitaires
│   │   ├── creditUtils.ts  # Utilitaires crédits
│   │   └── creditPricing.ts # Tarification des crédits
│   ├── types/               # Types TypeScript globaux
│   │   └── index.ts        # Définitions de types
│   ├── App.tsx             # Composant racine
│   ├── main.tsx            # Point d'entrée
│   └── index.css           # Styles globaux
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md     # Architecture technique
│   ├── API_DOCS.md         # Documentation API
│   ├── DB_SCHEMA.md        # Schéma base de données
│   ├── ROADMAP.md          # Feuille de route
│   └── CONTRIBUTING.md     # Guide de contribution
├── public/                  # Assets statiques
├── package.json            # Dépendances et scripts
├── tailwind.config.js      # Configuration Tailwind
├── tsconfig.json           # Configuration TypeScript
├── vite.config.ts          # Configuration Vite
└── README.md               # Ce fichier
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Preview du build
npm run lint         # Linting ESLint

# Tests
npm run test         # Tests unitaires
npm run test:watch   # Tests en mode watch
npm run test:coverage # Tests avec couverture
npm run test:ci      # Tests pour CI/CD
```

## 🌍 Déploiement

### **Vercel (Recommandé)**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Variables d'environnement
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### **Netlify**
```bash
# Build
npm run build

# Déployer le dossier dist/
# Configurer les variables d'environnement dans Netlify
```

### **Docker (Optionnel)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📊 Monitoring & Analytics

### **Métriques de Performance**
- **Core Web Vitals** : LCP, FID, CLS
- **Bundle Size** : Analyse avec Vite Bundle Analyzer
- **Lighthouse** : Tests de performance réguliers

### **Analytics (Optionnel)**
- **Google Analytics** : Suivi d'usage
- **Sentry** : Monitoring d'erreurs
- **LogRocket** : Session replay

## 🤝 Contribution

Voir [CONTRIBUTING.md](docs/CONTRIBUTING.md) pour les détails complets.

### **Workflow de Contribution**
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### **Standards de Code**
- **TypeScript strict** : Types explicites obligatoires
- **ESLint + Prettier** : Formatage automatique
- **Tests** : Couverture minimum 80%
- **Commits** : Conventionnal Commits
- **Documentation** : JSDoc pour les fonctions publiques

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

### **Documentation**
- [Architecture](docs/ARCHITECTURE.md) - Architecture technique détaillée
- [API Documentation](docs/API_DOCS.md) - Endpoints et intégrations
- [Database Schema](docs/DB_SCHEMA.md) - Structure de la base de données
- [Roadmap](docs/ROADMAP.md) - Feuille de route et fonctionnalités

### **Communauté**
- **Issues** : [GitHub Issues](https://github.com/votre-username/entraide-universelle/issues)
- **Discussions** : [GitHub Discussions](https://github.com/votre-username/entraide-universelle/discussions)
- **Email** : support@entraide-universelle.com

### **FAQ**
- **Problèmes de géolocalisation** : Vérifier les permissions du navigateur
- **Erreurs Supabase** : Vérifier les variables d'environnement
- **Performance** : Utiliser le mode production pour les tests

---

## 🎉 Remerciements

- **Supabase** pour l'infrastructure backend
- **OpenStreetMap** pour les données cartographiques
- **React** et **TypeScript** pour l'écosystème frontend
- **Tailwind CSS** pour le design system
- **Framer Motion** pour les animations

---

**Fait avec ❤️ pour connecter les communautés et favoriser l'entraide locale.**