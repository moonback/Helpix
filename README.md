# 🤝 Entraide Universelle

**Une plateforme d'entraide mobile-first où les utilisateurs échangent du temps, des compétences et des objets dans une économie de proximité mondiale.**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.38.5-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-blue.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Fonctionnalités

### 🔐 **Authentification & Profils**
- Inscription/Connexion sécurisée avec Supabase Auth
- Profils utilisateurs avec compétences et objets prêtables
- Gestion des sessions avec persistance automatique
- Onboarding intuitif pour les nouveaux utilisateurs

### 📱 **Interface Mobile-First**
- Design responsive optimisé pour tous les appareils
- Navigation bottom-tab intuitive
- Animations fluides avec Framer Motion
- Composants UI réutilisables et accessibles

### 🌍 **Géolocalisation Intelligente**
- Détection automatique de la position utilisateur
- Tri des tâches par proximité géographique
- Calcul de distances en temps réel
- Intégration avec OpenStreetMap et Nominatim

### 🗺️ **Carte Interactive**
- Visualisation des tâches sur une carte Leaflet
- Marqueurs interactifs avec informations détaillées
- Basculement entre vue carte et vue liste
- Navigation géographique intuitive

### 💳 **Système de Crédits**
- Économie virtuelle d'entraide
- Gestion des transactions entre utilisateurs
- Historique des échanges
- Système de notation et feedback

### 🎯 **Gestion des Tâches**
- Création/modification/suppression de tâches
- Catégorisation (sur place / à distance)
- Système de priorités (faible, moyenne, élevée, urgente)
- Filtres avancés et recherche textuelle
- Gestion des compétences requises et tags

### 💬 **Communication**
- Chat en temps réel entre utilisateurs
- Notifications et messages
- Système de commentaires sur les tâches

## 🛠️ Stack Technique

### **Frontend**
- **React 18** - Bibliothèque UI avec hooks et composants fonctionnels
- **TypeScript 5.2** - Typage statique et sécurité du code
- **Vite 5.0** - Build tool ultra-rapide et HMR
- **React Router v6** - Navigation SPA avec futures flags

### **UI & Design**
- **Tailwind CSS 3.3** - Framework CSS utility-first
- **Framer Motion 10.16** - Animations et transitions fluides
- **Lucide React** - Icônes SVG modernes et cohérentes
- **clsx + tailwind-merge** - Gestion intelligente des classes CSS

### **Backend & Base de Données**
- **Supabase 2.38** - Backend-as-a-Service avec PostgreSQL
- **PostgreSQL** - Base de données relationnelle robuste
- **Row Level Security (RLS)** - Sécurité granulaire des données
- **Real-time subscriptions** - Mises à jour en temps réel

### **État & Gestion des Données**
- **Zustand 4.4** - Store global léger et performant
- **Supabase Client** - SDK officiel pour l'API
- **Hooks personnalisés** - Logique métier réutilisable

### **Cartes & Géolocalisation**
- **Leaflet 1.9** - Bibliothèque de cartes open-source
- **React-Leaflet 4.2** - Composants React pour Leaflet
- **Geolocation API** - Position GPS native du navigateur
- **Nominatim** - Géocodage inverse via OpenStreetMap

### **Tests & Qualité**
- **Jest 29.7** - Framework de tests unitaires
- **React Testing Library** - Tests d'intégration React
- **ESLint** - Linting et formatage du code
- **TypeScript strict mode** - Vérifications de type strictes

## 🚀 Prérequis

### **Système**
- **Node.js** 18.0+ (recommandé: 20.x LTS)
- **npm** 9.0+ ou **yarn** 1.22+
- **Git** 2.30+

### **Compte Supabase**
- Projet Supabase créé sur [supabase.com](https://supabase.com)
- Clés d'API (URL et clé anonyme)
- Base de données PostgreSQL configurée

### **Navigateur**
- **Chrome** 90+, **Firefox** 88+, **Safari** 14+
- Support de la géolocalisation
- Support des modules ES6

## 📦 Installation

### 1. **Cloner le projet**
```bash
git clone https://github.com/votre-username/entraide-universelle.git
cd entraide-universelle
```

### 2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

### 3. **Configuration des variables d'environnement**
Créer un fichier `.env.local` à la racine :
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-supabase

# Configuration optionnelle
VITE_APP_NAME=Entraide Universelle
VITE_APP_VERSION=1.0.0
```

### 4. **Configuration de la base de données**
Exécuter le script SQL dans l'éditeur SQL de Supabase :
```sql
-- Voir DB_SCHEMA.md pour le schéma complet
-- ou exécuter directement le script de création des tables
```

## 🔧 Configuration

### **Configuration Supabase**
1. Créer un projet sur [supabase.com](https://supabase.com)
2. Récupérer l'URL et la clé anonyme dans Settings > API
3. Configurer l'authentification dans Authentication > Settings
4. Activer les politiques RLS pour la sécurité

### **Configuration de la géolocalisation**
- Vérifier que le navigateur supporte l'API Geolocation
- Configurer les permissions de localisation
- Tester avec des coordonnées de développement

### **Configuration des cartes**
- Leaflet utilise OpenStreetMap par défaut (gratuit)
- Possibilité d'utiliser d'autres providers (Google Maps, Mapbox)

## 🚀 Lancement

### **Développement**
```bash
npm run dev
# ou
yarn dev
```
L'application sera accessible sur `http://localhost:5173`

### **Build de production**
```bash
npm run build
# ou
yarn build
```

### **Prévisualisation du build**
```bash
npm run preview
# ou
yarn preview
```

### **Tests**
```bash
# Tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage

# Tests CI
npm run test:ci
```

### **Linting**
```bash
npm run lint
# ou
yarn lint
```

## 📁 Structure du Projet

```
entraide-universelle/
├── 📁 src/                          # Code source principal
│   ├── 📁 components/               # Composants UI réutilisables
│   │   ├── 📁 navigation/          # Navigation et routing
│   │   └── 📁 ui/                  # Composants de base
│   ├── 📁 features/                 # Fonctionnalités par domaine
│   │   ├── 📁 auth/                # Authentification
│   │   ├── 📁 home/                # Page d'accueil
│   │   ├── 📁 map/                 # Carte interactive
│   │   ├── 📁 add/                 # Création de tâches
│   │   ├── 📁 edit/                # Modification de tâches
│   │   ├── 📁 wallet/              # Gestion des crédits
│   │   ├── 📁 profile/             # Profil utilisateur
│   │   └── 📁 chat/                # Système de chat
│   ├── 📁 hooks/                   # Hooks personnalisés
│   ├── 📁 stores/                  # Stores Zustand
│   ├── 📁 lib/                     # Utilitaires et configuration
│   ├── 📁 types/                   # Types TypeScript
│   └── 📁 styles/                  # Styles globaux
├── 📁 docs/                         # Documentation technique
├── 📁 public/                       # Assets statiques
├── 📁 tests/                        # Tests et configuration
├── 📄 package.json                  # Dépendances et scripts
├── 📄 vite.config.ts               # Configuration Vite
├── 📄 tailwind.config.js           # Configuration Tailwind
├── 📄 tsconfig.json                # Configuration TypeScript
└── 📄 README.md                     # Ce fichier
```

## 🔐 Variables d'Environnement

| Variable | Description | Requis | Exemple |
|----------|-------------|---------|---------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | ✅ | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_APP_NAME` | Nom de l'application | ❌ | `Entraide Universelle` |
| `VITE_APP_VERSION` | Version de l'application | ❌ | `1.0.0` |

## 🧪 Tests

### **Structure des tests**
```
src/
├── 📁 __tests__/                    # Tests unitaires
├── 📁 components/                    # Tests des composants
├── 📁 hooks/                        # Tests des hooks
└── 📁 stores/                       # Tests des stores
```

### **Exécution des tests**
- **Tests unitaires** : `npm test`
- **Tests d'intégration** : `npm run test:integration`
- **Couverture** : `npm run test:coverage`
- **Tests CI** : `npm run test:ci`

### **Configuration Jest**
- Environnement : `jsdom`
- Preset : `ts-jest`
- Setup : `src/setupTests.ts`
- Coverage : HTML, LCOV, texte

## 🚀 Déploiement

### **Vercel (Recommandé)**
1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déploiement automatique à chaque push

### **Netlify**
1. Build command : `npm run build`
2. Publish directory : `dist`
3. Variables d'environnement dans l'interface

### **Supabase Edge Functions**
1. Déployer les fonctions serverless
2. Configurer les webhooks
3. Optimiser les performances

## 🤝 Contribution

### **Workflow Git**
1. Fork le projet
2. Créer une branche feature : `git checkout -b feature/nouvelle-fonctionnalite`
3. Commit les changements : `git commit -m 'feat: ajouter nouvelle fonctionnalité'`
4. Push vers la branche : `git push origin feature/nouvelle-fonctionnalite`
5. Créer une Pull Request

### **Standards de code**
- **TypeScript strict** : Tous les fichiers doivent être typés
- **ESLint** : Respecter les règles de linting
- **Prettier** : Formatage automatique du code
- **Conventional Commits** : Messages de commit standardisés

### **Tests**
- **Couverture minimale** : 80%
- **Tests unitaires** : Pour tous les composants
- **Tests d'intégration** : Pour les flux critiques
- **Tests E2E** : Pour les parcours utilisateur

## 📚 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture technique détaillée
- **[API_DOCS.md](docs/API_DOCS.md)** - Documentation des endpoints
- **[DB_SCHEMA.md](docs/DB_SCHEMA.md)** - Schéma de la base de données
- **[ROADMAP.md](docs/ROADMAP.md)** - Plan de développement futur
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Guide de contribution

## 🐛 Dépannage

### **Problèmes courants**

#### **Erreur de connexion Supabase**
```bash
# Vérifier les variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Vérifier la configuration dans src/lib/supabase.ts
```

#### **Problème de géolocalisation**
- Vérifier les permissions du navigateur
- Tester avec HTTPS (requis en production)
- Vérifier la console pour les erreurs

#### **Erreurs de build**
```bash
# Nettoyer le cache
rm -rf node_modules package-lock.json
npm install

# Vérifier la version de Node.js
node --version  # Doit être >= 18.0.0
```

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Supabase** pour l'infrastructure backend
- **Vercel** pour l'hébergement et le déploiement
- **OpenStreetMap** pour les données cartographiques
- **Communauté open-source** pour les bibliothèques utilisées

## 📞 Support

- **Issues GitHub** : [Créer une issue](https://github.com/votre-username/entraide-universelle/issues)
- **Discussions** : [Forum GitHub](https://github.com/votre-username/entraide-universelle/discussions)
- **Documentation** : [Wiki du projet](https://github.com/votre-username/entraide-universelle/wiki)

---

**Développé avec ❤️ pour créer une communauté d'entraide mondiale**

*Dernière mise à jour : Janvier 2024*
