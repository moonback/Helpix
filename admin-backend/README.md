# 🛠️ Backend Admin - Entraide Universelle

Backend d'administration complet pour la plateforme Entraide Universelle, construit avec Node.js, Express, TypeScript et Supabase.

## 🚀 Fonctionnalités

- **Authentification Admin** : Système de connexion sécurisé avec JWT
- **Gestion des Utilisateurs** : CRUD complet, suspension, bannissement
- **Gestion des Tâches** : Modération, assignation, suivi
- **Analytics Avancées** : Tableaux de bord, métriques, rapports
- **Système de Logs** : Traçabilité complète des actions admin
- **Rate Limiting** : Protection contre les abus
- **Monitoring** : Santé de l'application, métriques de performance
- **Sécurité** : Helmet, CORS, validation des entrées

## 🏗️ Architecture

```
admin-backend/
├── src/
│   ├── controllers/     # Contrôleurs API
│   ├── services/        # Logique métier
│   ├── middleware/      # Middlewares Express
│   ├── routes/          # Routes API
│   ├── utils/           # Utilitaires
│   ├── config/          # Configuration
│   ├── types/           # Types TypeScript
│   └── app.ts           # Application principale
├── tests/               # Tests unitaires et d'intégration
├── scripts/             # Scripts de migration et seeding
├── docker/              # Configuration Docker
└── docs/                # Documentation
```

## 🛠️ Technologies

- **Backend** : Node.js 18 + Express.js + TypeScript
- **Base de Données** : PostgreSQL (Supabase)
- **Cache** : Redis
- **Authentification** : JWT + bcrypt
- **Validation** : Joi
- **Logging** : Winston
- **Tests** : Jest + Supertest
- **Containerisation** : Docker + Docker Compose

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- Redis
- Compte Supabase
- Variables d'environnement configurées

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd admin-backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Copiez le fichier d'exemple et configurez vos variables :

```bash
cp env.example .env
```

Éditez le fichier `.env` avec vos valeurs :

```env
# Configuration de l'application
NODE_ENV=development
PORT=3000

# Base de données Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Admin par défaut
ADMIN_EMAIL=admin@entraide-universelle.com
ADMIN_PASSWORD=admin_password_123
```

### 4. Configuration de la base de données

Exécutez les migrations pour créer les tables nécessaires :

```bash
npm run migrate
```

### 5. Seeding de la base de données

Créez les données initiales (admin par défaut, catégories, etc.) :

```bash
npm run seed
```

### 6. Démarrage de l'application

#### Mode développement

```bash
npm run dev
```

#### Mode production

```bash
npm run build
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🧪 Tests

### Exécuter tous les tests

```bash
npm test
```

### Tests en mode watch

```bash
npm run test:watch
```

### Tests avec couverture

```bash
npm run test:coverage
```

## 🐳 Déploiement avec Docker

### 1. Construction de l'image

```bash
docker build -t entraide-admin-backend .
```

### 2. Démarrage avec Docker Compose

```bash
cd docker
docker-compose up -d
```

### 3. Vérification

```bash
curl http://localhost:3000/health
```

## 📚 API Documentation

### Authentification

#### Connexion
```bash
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@entraide-universelle.com",
  "password": "admin_password_123"
}
```

#### Rafraîchissement du token
```bash
POST /api/admin/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### Utilisateurs

#### Récupérer tous les utilisateurs
```bash
GET /api/admin/users?page=1&limit=20&status=active
Authorization: Bearer your_jwt_token
```

#### Suspendre un utilisateur
```bash
POST /api/admin/users/:id/suspend
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "reason": "Violation des conditions d'utilisation",
  "duration": 604800000
}
```

### Tâches

#### Récupérer toutes les tâches
```bash
GET /api/admin/tasks?page=1&limit=20&status=open
Authorization: Bearer your_jwt_token
```

#### Assigner une tâche
```bash
POST /api/admin/tasks/:id/assign
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "assignedTo": "user_id_here"
}
```

### Analytics

#### Dashboard complet
```bash
GET /api/admin/analytics/dashboard?start=2023-01-01&end=2023-12-31
Authorization: Bearer your_jwt_token
```

#### Métriques générales
```bash
GET /api/admin/analytics/metrics?start=2023-01-01&end=2023-12-31
Authorization: Bearer your_jwt_token
```

## 🔐 Rôles et Permissions

### Rôles Admin

- **SUPER_ADMIN** : Accès complet à toutes les fonctionnalités
- **ADMIN** : Gestion des utilisateurs et tâches
- **MODERATOR** : Modération des tâches et utilisateurs
- **SUPPORT** : Support client et consultation
- **ANALYST** : Accès aux analytics et rapports

### Permissions

- `view_users` : Consulter les utilisateurs
- `edit_users` : Modifier les utilisateurs
- `delete_users` : Supprimer les utilisateurs
- `ban_users` : Suspendre/bannir les utilisateurs
- `view_tasks` : Consulter les tâches
- `edit_tasks` : Modifier les tâches
- `delete_tasks` : Supprimer les tâches
- `moderate_tasks` : Modérer les tâches
- `view_transactions` : Consulter les transactions
- `process_withdrawals` : Traiter les retraits
- `manage_credits` : Gérer les crédits
- `view_analytics` : Consulter les analytics
- `export_data` : Exporter les données
- `manage_settings` : Gérer les paramètres
- `view_logs` : Consulter les logs
- `manage_notifications` : Gérer les notifications

## 📊 Monitoring

### Endpoints de santé

- `GET /health` : État général de l'application
- `GET /metrics` : Métriques Prometheus (restreint)

### Logs

Les logs sont stockés dans le répertoire `logs/` :
- `combined.log` : Tous les logs
- `error.log` : Erreurs uniquement
- `exceptions.log` : Exceptions non gérées
- `rejections.log` : Promesses rejetées

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev          # Démarrage en mode développement
npm run build        # Compilation TypeScript
npm start           # Démarrage en production

# Tests
npm test            # Exécuter tous les tests
npm run test:watch  # Tests en mode watch
npm run test:coverage # Tests avec couverture

# Base de données
npm run migrate     # Exécuter les migrations
npm run seed        # Seeding des données

# Qualité de code
npm run lint        # Vérification ESLint
npm run lint:fix    # Correction automatique ESLint
```

## 🚨 Sécurité

### Mesures de sécurité implémentées

- **Authentification JWT** avec refresh tokens
- **Rate limiting** par endpoint et par utilisateur
- **Validation stricte** des entrées avec Joi
- **Sanitisation** des données utilisateur
- **Headers de sécurité** avec Helmet
- **CORS** configuré
- **Logs de sécurité** pour audit
- **Chiffrement** des mots de passe avec bcrypt

### Recommandations

- Changez le JWT_SECRET en production
- Utilisez HTTPS en production
- Configurez un firewall approprié
- Surveillez les logs de sécurité
- Mettez à jour régulièrement les dépendances

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :

- Créez une issue sur GitHub
- Contactez l'équipe de développement
- Consultez la documentation Supabase

---

**Développé avec ❤️ pour Entraide Universelle**
