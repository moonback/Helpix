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
- Calculs de distance en temps réel

### 🗺️ **Carte Interactive**
- Visualisation des tâches sur carte Leaflet
- Marqueurs interactifs avec popups détaillées
- Bascule vue carte / vue liste
- Clustering des marqueurs pour performances

### 💬 **Système de Messagerie**
- Chat en temps réel entre utilisateurs
- Support messages texte, images et fichiers
- Interface conversationnelle moderne avec glassmorphism
- Notifications et statuts de lecture

### 🎯 **Gestion Avancée des Tâches**
- Création/modification/suppression de tâches
- Catégorisation (local/remote) avec priorités
- Système de filtres et recherche avancée
- Tableau de bord analytique complet
- Suivi de progression détaillé

### 💳 **Système de Crédits**
- Économie virtuelle d'entraide
- Gestion des transactions transparente
- Historique complet des échanges
- Portefeuille intégré

## 🛠️ Stack Technique

### **Frontend**
- **React 18** - Bibliothèque UI avec hooks et suspense
- **TypeScript 5.2** - Typage statique strict
- **Vite 5.0** - Build tool ultra-rapide avec HMR
- **React Router v6** - Navigation SPA avec futures flags

### **UI & Design**
- **Tailwind CSS 3.3** - Framework CSS utility-first
- **Framer Motion 10.16** - Animations et micro-interactions
- **Lucide React** - Icônes SVG cohérentes et modernes
- **clsx + tailwind-merge** - Gestion intelligente des classes

### **Backend & Database**
- **Supabase 2.38** - Backend-as-a-Service complet
- **PostgreSQL** - Base de données relationnelle robuste
- **Row Level Security (RLS)** - Sécurité granulaire
- **Real-time subscriptions** - Synchronisation temps réel

### **State Management**
- **Zustand 4.4** - Store global léger et performant
- **Hooks personnalisés** - Logique métier encapsulée
- **React Query patterns** - Gestion cache et synchronisation

### **Maps & Geolocation**
- **Leaflet 1.9** - Cartographie open-source
- **React-Leaflet 4.2** - Intégration React
- **Geolocation API** - Position GPS native
- **Services géocodage** - Multiple providers avec fallbacks

### **Development & Testing**
- **Jest 29.7** - Framework de tests
- **React Testing Library** - Tests d'intégration
- **ESLint** - Linting et qualité code
- **TypeScript strict** - Type checking complet

## 🚀 Installation

### **Prérequis**
- **Node.js** 18.0+ (recommandé: 20.x LTS)
- **npm** 9.0+ ou **yarn** 1.22+
- **Git** 2.30+
- **Compte Supabase** actif

### **1. Cloner le Repository**
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

### **3. Configuration Environnement**

Créer `.env.local` à la racine :
```env
# Configuration Supabase (OBLIGATOIRE)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme-supabase

# Configuration App (OPTIONNEL)
VITE_APP_NAME=Entraide Universelle
VITE_APP_VERSION=1.0.0

# Services externes (OPTIONNEL)
VITE_NOMINATIM_URL=https://nominatim.openstreetmap.org
VITE_BIGDATACLOUD_API_KEY=votre-clé-bigdatacloud
VITE_LOCATIONIQ_API_KEY=votre-clé-locationiq
```

### **4. Configuration Supabase**

#### **A. Créer le Projet**
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Copier URL et clé anonyme dans `.env.local`

#### **B. Configurer la Base de Données**
```sql
-- Exécuter dans l'éditeur SQL Supabase
-- Voir docs/DB_SCHEMA.md pour le schéma complet

-- Tables principales
CREATE TABLE users (...);
CREATE TABLE tasks (...);
CREATE TABLE conversations (...);
CREATE TABLE messages (...);
-- Etc.

-- Activer RLS et créer les politiques
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Voir API_DOCS.md pour toutes les politiques
```

#### **C. Configurer l'Authentification**
1. **Authentication > Settings** dans Supabase
2. Activer "Enable email confirmations" (recommandé)
3. Configurer les URLs de redirection :
   - Site URL: `http://localhost:5173` (dev)
   - Redirect URLs: `http://localhost:5173/**` (dev)

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
│   │   ├── tasks/          # Gestion des tâches
│   │   ├── chat/           # Messagerie
│   │   ├── map/            # Carte interactive
│   │   ├── profile/        # Profil utilisateur
│   │   ├── wallet/         # Portefeuille et crédits
│   │   └── dashboard/      # Tableau de bord analytique
│   ├── hooks/               # Hooks personnalisés
│   │   ├── useAuth.ts      # Gestion authentification
│   │   ├── useGeolocation.ts # Géolocalisation avec fallbacks
│   │   ├── useReverseGeocoding.ts # Géocodage inverse
│   │   └── useRealtimeMessages.ts # Messages temps réel
│   ├── stores/              # Stores Zustand
│   │   ├── authStore.ts    # État authentification
│   │   ├── taskStore.ts    # État tâches avec analytics
│   │   └── messageStore.ts # État messagerie
│   ├── types/               # Types TypeScript globaux
│   │   └── index.ts        # Interfaces principales
│   └── lib/                 # Utilitaires et configuration
│       ├── supabase.ts     # Client Supabase configuré
│       ├── utils.ts        # Fonctions utilitaires
│       └── router.ts       # Configuration routage
├── docs/                    # Documentation technique
│   ├── ARCHITECTURE.md     # Architecture détaillée
│   ├── API_DOCS.md         # Documentation API
│   ├── DB_SCHEMA.md        # Schéma base de données
│   ├── ROADMAP.md          # Feuille de route
│   └── CONTRIBUTING.md     # Guide contribution
├── public/                  # Assets statiques
└── dist/                    # Build de production
```

## 🧪 Tests et Qualité

### **Lancer les Tests**
```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage

# Tests CI
npm run test:ci
```

### **Linting et Formatting**
```bash
# Vérifier le code
npm run lint

# Build TypeScript
npm run build
```

## 🌍 Variables d'Environnement

### **Variables Obligatoires**
| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL du projet Supabase | `https://abc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | `eyJ0eXAiOiJKV1Q...` |

### **Variables Optionnelles**
| Variable | Description | Défaut |
|----------|-------------|--------|
| `VITE_APP_NAME` | Nom de l'application | `Entraide Universelle` |
| `VITE_APP_VERSION` | Version affichée | `1.0.0` |
| `VITE_NOMINATIM_URL` | URL service Nominatim | `https://nominatim.openstreetmap.org` |

## 🚀 Déploiement

### **Plateformes Recommandées**

#### **Vercel (Recommandé)**
```bash
# Installation Vercel CLI
npm i -g vercel

# Déploiement
vercel --prod
```

#### **Netlify**
```bash
# Build
npm run build

# Déployer le dossier dist/
```

#### **Configuration Variables**
Ajouter dans l'interface de votre plateforme :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Et autres variables selon besoins

## 📚 Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - Design technique détaillé
- **[API Documentation](docs/API_DOCS.md)** - Endpoints et exemples
- **[Database Schema](docs/DB_SCHEMA.md)** - Structure base de données
- **[Roadmap](docs/ROADMAP.md)** - Évolutions planifiées
- **[Contributing](docs/CONTRIBUTING.md)** - Guide pour contribuer

## 🤝 Contribution

Voir [CONTRIBUTING.md](docs/CONTRIBUTING.md) pour :
- Process de contribution
- Standards de code
- Guidelines de commit
- Tests requis

## 🐛 Signaler un Bug

1. Vérifier les [issues existants](https://github.com/votre-username/entraide-universelle/issues)
2. Créer un nouvel issue avec :
   - Description claire du problème
   - Étapes pour reproduire
   - Capture d'écran si applicable
   - Informations environnement (OS, navigateur)

## 📄 Licence

Ce projet est sous licence **MIT** - voir [LICENSE](LICENSE) pour détails.

## 🏆 Statut du Projet

- ✅ **MVP Complété** - Fonctionnalités de base opérationnelles
- 🚧 **V1.0 En Cours** - Améliorations UX et features avancées
- 📋 **V2.0 Planifiée** - Applications mobiles et API publique

## 🔗 Liens Utiles

- **Demo Live** : [https://entraide-universelle.vercel.app](https://entraide-universelle.vercel.app)
- **Documentation** : [docs/](docs/)
- **Supabase Dashboard** : [supabase.com/dashboard](https://supabase.com/dashboard)
- **Issues & Support** : [GitHub Issues](https://github.com/votre-username/entraide-universelle/issues)

---

**Fait avec ❤️ pour créer un monde plus solidaire**