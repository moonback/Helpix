# 🤝 Entraide Universelle

Une plateforme d'entraide mobile-first où les utilisateurs échangent du temps, des compétences et des objets dans une économie de proximité mondiale.

## ✨ Fonctionnalités

- **🔐 Authentification complète** avec Supabase
- **📱 Interface mobile-first** optimisée pour tous les appareils
- **🗺️ Carte interactive** avec Leaflet.js pour localiser les opportunités
- **💳 Système de crédits** pour gérer les échanges
- **💬 Chat en temps réel** (mock) pour la communication
- **👤 Profils utilisateurs** avec compétences et objets prêtables
- **🎯 Gestion des tâches** avec statuts et catégorisation

## 🛠️ Tech Stack

- **Frontend** : React 18 + TypeScript + Vite
- **UI** : TailwindCSS + Framer Motion
- **Navigation** : React Router v6
- **État global** : Zustand
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Cartes** : Leaflet.js + React-Leaflet
- **Icônes** : Lucide React

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd entraide-universelle
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Créez un fichier `.env.local` à la racine :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

### 4. Base de données

Exécutez ce SQL dans l'éditeur SQL de Supabase :

```sql
-- Table des utilisateurs
create table users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique not null,
    password_hash text not null,
    avatar_url text,
    bio text,
    location text,
    credits int default 100,
    created_at timestamp default now()
);

-- Table des compétences
create table skills (
    id serial primary key,
    user_id uuid references users(id) on delete cascade,
    skill_name text not null
);

-- Table des objets
create table items (
    id serial primary key,
    user_id uuid references users(id) on delete cascade,
    item_name text not null,
    description text,
    available boolean default true
);

-- Table des tâches
create table tasks (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  title text not null,
  description text not null,
  category text check (category in ('local','remote')) default 'local',
  status text check (status in ('open','in_progress','completed','cancelled')) default 'open',
  priority text check (priority in ('low','medium','high','urgent')) default 'medium',
  estimated_duration integer not null, -- en heures
  location text not null,
  latitude numeric(10,8),
  longitude numeric(11,8),
  required_skills text[] default '{}',
  budget_credits integer not null default 0,
  deadline timestamp,
  tags text[] default '{}',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  assigned_to uuid references users(id),
  completion_date timestamp,
  rating integer check (rating >= 1 and rating <= 5),
  feedback text
);

-- Table des transactions
create table transactions (
    id serial primary key,
    sender_id uuid references users(id) on delete cascade,
    receiver_id uuid references users(id) on delete cascade,
    credits int not null,
    task_id int references tasks(id) on delete set null,
    created_at timestamp default now()
);

-- Table des messages
create table messages (
    id serial primary key,
    sender_id uuid references users(id) on delete cascade,
    receiver_id uuid references users(id) on delete cascade,
    content text not null,
    created_at timestamp default now()
);
```

### 5. Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📱 Structure de l'application

```
src/
├── components/          # Composants UI réutilisables
│   ├── ui/             # Composants de base (Button, Card, Input)
│   └── navigation/     # Navigation et routing
├── features/           # Fonctionnalités par domaine
│   ├── auth/          # Authentification et onboarding
│   ├── home/          # Page d'accueil et feed
│   ├── map/           # Carte interactive
│   ├── add/           # Création de tâches
│   ├── wallet/        # Gestion des crédits
│   ├── profile/       # Profil utilisateur
│   └── chat/          # Système de chat
├── stores/            # Stores Zustand
├── lib/               # Configuration et utilitaires
├── types/             # Types TypeScript
└── hooks/             # Hooks personnalisés
```

## 🎨 Design System

### Couleurs

- **Primary** : Bleu (#0ea5e9) - Actions principales
- **Secondary** : Gris (#64748b) - Éléments secondaires
- **Success** : Vert (#10b981) - États positifs
- **Warning** : Jaune (#f59e0b) - Avertissements
- **Error** : Rouge (#ef4444) - Erreurs

### Typographie

- **Police** : Inter (Google Fonts)
- **Tailles** : Mobile-first avec breakpoints Tailwind

### Composants

- **Boutons** : 5 variantes (primary, secondary, outline, ghost, danger)
- **Cartes** : Avec ombres et animations au hover
- **Inputs** : Avec validation et états d'erreur
- **Navigation** : Bottom navigation mobile-first

## 🔧 Scripts disponibles

```bash
npm run dev          # Démarre le serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualise le build
npm run lint         # Vérifie le code avec ESLint
```

## 📱 Responsive Design

- **Mobile** : < 768px - Design optimisé tactile
- **Tablet** : 768px - 1024px - Adaptation tablette
- **Desktop** : > 1024px - Interface étendue

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez vos variables d'environnement
3. Déployez automatiquement

### Netlify

1. Build : `npm run build`
2. Dossier de sortie : `dist`
3. Ajoutez vos variables d'environnement

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

1. Vérifiez la documentation Supabase
2. Consultez les issues GitHub
3. Créez une nouvelle issue si nécessaire

## 🔮 Roadmap

- [ ] Notifications push
- [ ] Système de notation et avis
- [ ] Intégration paiements
- [ ] Mode hors ligne
- [ ] API publique
- [ ] Applications mobiles natives

---

**Développé avec ❤️ pour créer une communauté d'entraide mondiale**
