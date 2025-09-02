# 🌍 Helpix

**Une plateforme d'entraide géolocalisée qui connecte les communautés locales pour créer un écosystème de solidarité et d'échange de services.**

Helpix permet aux utilisateurs de proposer et demander de l'aide dans leur région, en utilisant un système de crédits équitable et une interface moderne et intuitive.

## 🚀 Fonctionnalités Principales

### ✅ **MVP Disponible**

#### **🔐 Authentification & Profil**
- Inscription/connexion sécurisée avec Supabase Auth
- Profil utilisateur complet avec géolocalisation
- Système de notation et avis communautaires
- Onboarding interactif pour nouveaux utilisateurs

#### **📋 Gestion des Tâches**
- Création de tâches d'entraide géolocalisées
- Système de catégories (déménagement, bricolage, aide ménagère, etc.)
- Filtrage avancé par distance, budget, catégorie
- Statuts de progression : ouvert → en cours → terminé
- Système d'offres d'aide et assignation

#### **💰 Système de Crédits**
- Portefeuille virtuel avec transactions sécurisées
- Achat de crédits via Stripe (packages optimisés)
- Gains automatiques pour services rendus
- Système de retrait vers comptes bancaires
- Historique complet des transactions

#### **💬 Messagerie Temps Réel**
- Chat instantané entre utilisateurs
- Conversations liées aux tâches
- Notifications push intégrées
- Historique des messages synchronisé

#### **🗺️ Géolocalisation Avancée**
- Carte interactive avec tâches et objets à louer
- Recherche par proximité (rayon personnalisable)
- Géocodage automatique d'adresses
- Affichage d'informations de localisation détaillées

#### **📱 Interface Responsive**
- Design mobile-first avec Tailwind CSS
- Animations fluides avec Framer Motion
- Navigation intuitive avec bottom tabs
- Mode sombre/clair (en développement)

#### **🏠 Page d'Accueil Interactive**
- Tableau de bord personnalisé
- Actions rapides (créer tâche, parcourir aide)
- Métriques d'activité en temps réel
- Suggestions basées sur la localisation

#### **🏪 Système de Location**
- Marketplace d'objets à louer
- Intégration carte pour visualisation
- Système de réservation et paiement
- Gestion des dépôts et retours

## 🛠️ Stack Technique

### **Frontend**
- **React 18** - Framework avec concurrent features
- **TypeScript** - Sécurité de type stricte
- **Vite** - Build tool moderne et rapide
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations et micro-interactions
- **Lucide React** - Icônes modernes et cohérentes

### **Backend & Services**
- **Supabase** - Backend-as-a-Service complet
  - PostgreSQL avec Row Level Security
  - Authentification JWT
  - Real-time subscriptions
  - Storage pour fichiers
- **Stripe** - Paiements sécurisés
- **APIs Géolocalisation** - Nominatim, BigDataCloud

### **State Management**
- **Zustand** - Gestion d'état simple et performante
- **React Query** - Cache et synchronisation des données
- **React Router v6** - Navigation client-side

### **Outils de Développement**
- **ESLint + Prettier** - Qualité et formatage du code
- **Jest + Testing Library** - Tests unitaires et d'intégration
- **TypeScript strict** - Vérification de types
- **Supabase CLI** - Développement local

## 🚀 Installation et Configuration

### **Prérequis**
```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.30.0
Supabase CLI >= 1.0.0 (optionnel pour dev local)
```

### **1. Cloner le Repository**
```bash
git clone https://github.com/votre-username/entraide-universelle.git
cd entraide-universelle
```

### **2. Installer les Dépendances**
```bash
npm install
```

### **3. Configuration des Variables d'Environnement**
Créez un fichier `.env.local` :
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# APIs Géolocalisation
VITE_BIGDATACLOUD_API_KEY=your_bigdatacloud_key
VITE_LOCATIONIQ_API_KEY=your_locationiq_key

# Stripe (Paiements)
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Configuration App
VITE_APP_NAME="Helpix"
VITE_APP_VERSION="1.0.0"
```

### **4. Configuration Supabase**

#### **Créer un Projet Supabase**
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL et la clé anonyme

#### **Importer le Schéma de Base de Données**
```bash
# Si vous utilisez Supabase CLI
supabase start
supabase db reset

# Ou importez manuellement les fichiers SQL du dossier docs/
```

### **5. Lancer l'Application**
```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualisation de production
npm run preview
```

L'application sera disponible sur `http://localhost:5173`

## 📁 Structure du Projet

```
entraide-universelle/
├── public/                     # Assets statiques
│   └── images/                # Images et logos
├── src/
│   ├── components/            # Composants UI réutilisables
│   │   ├── ui/               # Design system de base
│   │   ├── chat/             # Composants de messagerie
│   │   ├── layout/           # Layouts et navigation
│   │   └── navigation/       # Navigation mobile
│   ├── features/             # Fonctionnalités par domaine
│   │   ├── auth/            # Authentification
│   │   ├── home/            # Page d'accueil
│   │   ├── dashboard/       # Tableau de bord
│   │   ├── wallet/          # Système de crédits
│   │   ├── chat/            # Messagerie
│   │   ├── map/             # Carte et géolocalisation
│   │   ├── profile/         # Profil utilisateur
│   │   ├── add/             # Création de tâches
│   │   ├── edit/            # Modification de tâches
│   │   ├── task-detail/     # Détail des tâches
│   │   ├── help-offers/     # Offres d'aide
│   │   ├── rentals/         # Système de location
│   │   └── landing/         # Page d'atterrissage
│   ├── hooks/               # Hooks personnalisés
│   │   ├── useAuth.ts       # Authentification
│   │   ├── useGeolocation.ts # Géolocalisation
│   │   ├── useReverseGeocoding.ts # Géocodage
│   │   └── useRealtimeMessages.ts # Messages temps réel
│   ├── stores/              # Gestion d'état Zustand
│   │   ├── authStore.ts     # État authentification
│   │   ├── taskStore.ts     # État des tâches
│   │   ├── messageStore.ts  # État des messages
│   │   └── helpOfferStore.ts # État des offres
│   ├── lib/                 # Utilitaires et configurations
│   │   ├── supabase.ts      # Client Supabase
│   │   ├── utils.ts         # Fonctions utilitaires
│   │   ├── creditUtils.ts   # Logique des crédits
│   │   ├── creditPricing.ts # Tarification
│   │   └── router.ts        # Configuration des routes
│   ├── types/               # Types TypeScript
│   │   └── index.ts         # Définitions globales
│   └── styles/              # Styles globaux
├── docs/                    # Documentation
├── tests/                   # Tests
└── dist/                    # Build de production
```

## 🧪 Tests et Qualité

### **Lancer les Tests**
```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests CI/CD
npm run test:ci
```

### **Linting et Formatage**
```bash
# Vérifier le code
npm run lint

# Corriger automatiquement
npm run lint --fix

# Vérifier les types TypeScript
npm run type-check
```

### **Standards de Code**
- **TypeScript strict** activé
- **ESLint** avec règles strictes
- **Prettier** pour le formatage automatique
- **Conventional Commits** pour les messages de commit
- **Husky** pour les pre-commit hooks

## 🌍 Variables d'Environnement

### **Configuration Complète**
```bash
# === SUPABASE ===
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# === GÉOLOCALISATION ===
VITE_BIGDATACLOUD_API_KEY=your_bigdatacloud_api_key
VITE_LOCATIONIQ_API_KEY=your_locationiq_api_key
VITE_NOMINATIM_URL=https://nominatim.openstreetmap.org

# === PAIEMENTS ===
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# === CONFIGURATION APP ===
VITE_APP_NAME="Helpix"
VITE_APP_VERSION="1.0.0"
VITE_APP_DESCRIPTION="Plateforme d'entraide géolocalisée"
VITE_APP_URL=https://entraide-universelle.com

# === DÉVELOPPEMENT ===
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

## 🚢 Déploiement

### **Production avec Vercel (Recommandé)**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### **Build de Production**
```bash
# Créer le build
npm run build

# Tester le build localement
npm run preview
```

### **Variables d'Environnement Production**
- Configurez toutes les variables d'environnement dans votre plateforme de déploiement
- Assurez-vous que les URLs de production sont correctes
- Activez HTTPS en production

## 🤝 Contribution

Nous accueillons les contributions ! Consultez notre [Guide de Contribution](CONTRIBUTING.md) pour plus de détails.

### **Processus de Contribution**
1. **Fork** le repository
2. **Créez** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Committez** vos changements (`git commit -m 'feat: add amazing feature'`)
4. **Poussez** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrez** une Pull Request

### **Standards de Commit**
Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

## 📖 Documentation

### **Documentation Technique**
- [Architecture](docs/ARCHITECTURE.md) - Architecture détaillée du système
- [API Documentation](docs/API_DOCS.md) - Endpoints et utilisation
- [Schéma BDD](docs/DB_SCHEMA.md) - Structure de la base de données
- [Roadmap](docs/ROADMAP.md) - Feuille de route du projet

### **Guides de Développement**
- [Guide de Contribution](CONTRIBUTING.md) - Comment contribuer
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Résolution de problèmes
- [Best Practices](docs/BEST_PRACTICES.md) - Bonnes pratiques

## 🗺️ Roadmap

### **🚀 Phase 1 : MVP (Terminé)**
- ✅ Authentification utilisateur
- ✅ CRUD des tâches
- ✅ Système de crédits de base
- ✅ Géolocalisation
- ✅ Interface responsive

### **🔥 Phase 2 : V1.0 (En Cours)**
- 🚧 Messagerie temps réel avancée
- 🚧 Notifications push
- 🚧 Système de notation complet
- 🚧 Paiements Stripe intégrés
- 🚧 Optimisations performance

### **🌟 Phase 3 : V2.0 (Planifié)**
- 📋 Applications mobiles natives
- 📋 Intelligence artificielle
- 📋 Système de parrainage
- 📋 Internationalisation
- 📋 API publique

### **🚀 Phase 4 : V3.0 (Vision)**
- 🔮 Blockchain et Web3
- 🔮 Réalité augmentée
- 🔮 Écosystème de partenaires
- 🔮 Expansion mondiale

## 📊 Métriques et Performance

### **Objectifs de Performance**
- **Temps de chargement** : < 2 secondes
- **First Contentful Paint** : < 1.5 secondes
- **Largest Contentful Paint** : < 2.5 secondes
- **Cumulative Layout Shift** : < 0.1
- **First Input Delay** : < 100ms

### **Monitoring**
- **Sentry** pour le tracking d'erreurs
- **Google Analytics** pour l'usage
- **Lighthouse** pour la performance
- **Core Web Vitals** suivi en continu

## 🔒 Sécurité et Confidentialité

### **Mesures de Sécurité**
- **Row Level Security** (RLS) activé sur toutes les tables
- **Validation** des données côté client et serveur
- **Chiffrement** des données sensibles
- **HTTPS** obligatoire en production
- **CORS** configuré strictement

### **Conformité**
- **RGPD** compliant (données européennes)
- **Privacy by Design** intégré
- **Audit trail** pour les actions sensibles
- **Anonymisation** des données de test

## 🆘 Support et Communauté

### **Obtenir de l'Aide**
- 📧 **Email** : support@entraide-universelle.com
- 💬 **Discord** : [Rejoindre notre communauté](https://discord.gg/entraide-universelle)
- 🐛 **Issues** : [GitHub Issues](https://github.com/votre-username/entraide-universelle/issues)
- 💡 **Discussions** : [GitHub Discussions](https://github.com/votre-username/entraide-universelle/discussions)

### **Ressources**
- [FAQ](docs/FAQ.md) - Questions fréquentes
- [Tutoriels](docs/tutorials/) - Guides d'utilisation
- [Blog](https://blog.entraide-universelle.com) - Actualités et guides
- [Status Page](https://status.entraide-universelle.com) - État des services

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2024 Helpix

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Remerciements

### **Technologies**
Merci aux créateurs et mainteneurs de :
- [React](https://react.dev) - Framework frontend
- [Supabase](https://supabase.com) - Backend-as-a-Service
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Vite](https://vitejs.dev) - Build tool
- [TypeScript](https://www.typescriptlang.org) - Sécurité de type

### **Communauté**
Merci à tous les contributeurs, testeurs et utilisateurs qui rendent ce projet possible !

### **Inspiration**
Ce projet s'inspire des valeurs de solidarité, d'entraide et de communauté. Notre mission est de connecter les gens pour créer un monde plus solidaire, une tâche à la fois.

---

## 🌟 **Ensemble, construisons un monde plus solidaire !**

**Développé avec ❤️ par l'équipe Helpix**

[Site Web](https://entraide-universelle.com) • [Twitter](https://twitter.com/entraide_univ) • [LinkedIn](https://linkedin.com/company/entraide-universelle) • [Blog](https://blog.entraide-universelle.com)

---

*Dernière mise à jour : Janvier 2024*