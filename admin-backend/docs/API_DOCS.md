# 📚 Documentation API - Backend Admin Entraide Universelle

## 🎯 Vue d'ensemble

Cette API REST fournit toutes les fonctionnalités d'administration pour la plateforme Entraide Universelle. Elle est sécurisée par JWT et utilise un système de rôles et permissions granulaire.

**Base URL** : `http://localhost:3000/api/admin`

## 🔐 Authentification

Toutes les routes (sauf `/auth/login` et `/auth/refresh-token`) nécessitent un token JWT dans l'en-tête `Authorization`.

```bash
Authorization: Bearer <jwt_token>
```

### Endpoints d'authentification

#### POST /auth/login
Connexion admin

**Body:**
```json
{
  "email": "admin@entraide-universelle.com",
  "password": "admin_password_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "admin-123",
      "email": "admin@entraide-universelle.com",
      "name": "Administrateur",
      "role": "super_admin",
      "isActive": true,
      "lastLoginAt": "2023-12-01T10:00:00Z",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-12-01T10:00:00Z"
    },
    "expiresIn": 86400000
  },
  "message": "Connexion réussie"
}
```

#### POST /auth/refresh-token
Rafraîchir le token

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
Déconnexion

**Headers:** `Authorization: Bearer <token>`

#### GET /auth/check
Vérifier l'authentification

**Headers:** `Authorization: Bearer <token>`

## 👥 Gestion des Utilisateurs

### Endpoints utilisateurs

#### GET /users
Récupérer tous les utilisateurs avec filtres et pagination

**Query Parameters:**
- `page` (number, default: 1) - Numéro de page
- `limit` (number, default: 20) - Nombre d'éléments par page
- `status` (string) - Statut de l'utilisateur (active, inactive, suspended, banned)
- `location` (string) - Localisation
- `createdAfter` (date) - Date de création après
- `createdBefore` (date) - Date de création avant
- `emailVerified` (boolean) - Email vérifié
- `phoneVerified` (boolean) - Téléphone vérifié
- `search` (string) - Recherche dans nom/email

**Example:**
```bash
GET /users?page=1&limit=20&status=active&search=john
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "email": "john@example.com",
      "name": "John Doe",
      "location": "Paris, France",
      "status": "active",
      "rating": 4.5,
      "total_tasks": 10,
      "completed_tasks": 8,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### GET /users/:id
Récupérer un utilisateur par ID

#### PATCH /users/:id
Mettre à jour un utilisateur

**Body:**
```json
{
  "name": "John Doe Updated",
  "location": "Lyon, France",
  "status": "active"
}
```

#### POST /users/:id/suspend
Suspendre un utilisateur

**Body:**
```json
{
  "reason": "Violation des conditions d'utilisation",
  "duration": 604800000
}
```

#### POST /users/:id/ban
Bannir un utilisateur

**Body:**
```json
{
  "reason": "Comportement inapproprié"
}
```

#### POST /users/:id/reactivate
Réactiver un utilisateur

#### DELETE /users/:id
Supprimer un utilisateur (soft delete)

#### GET /users/stats
Statistiques des utilisateurs

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "activeUsers": 1200,
    "suspendedUsers": 50,
    "newUsersToday": 25,
    "newUsersThisWeek": 150,
    "newUsersThisMonth": 600
  }
}
```

#### GET /users/export
Exporter les utilisateurs

**Query Parameters:**
- `format` (string) - Format d'export (csv, json)
- Filtres identiques à GET /users

## 📋 Gestion des Tâches

### Endpoints tâches

#### GET /tasks
Récupérer toutes les tâches avec filtres

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Statut (open, assigned, in_progress, completed, cancelled, on_hold)
- `category` - Catégorie
- `priority` - Priorité (low, medium, high, urgent)
- `location` - Localisation
- `budgetMin`, `budgetMax` - Budget
- `isPaid` - Tâche payante
- `assignedTo` - Assigné à
- `search` - Recherche dans titre/description

#### GET /tasks/:id
Récupérer une tâche par ID

#### PATCH /tasks/:id
Mettre à jour une tâche

#### POST /tasks/:id/assign
Assigner une tâche

**Body:**
```json
{
  "assignedTo": "user-123"
}
```

#### POST /tasks/:id/complete
Marquer une tâche comme terminée

#### POST /tasks/:id/hold
Mettre une tâche en attente

**Body:**
```json
{
  "reason": "En attente de clarification"
}
```

#### DELETE /tasks/:id
Supprimer une tâche

#### GET /tasks/stats
Statistiques des tâches

#### GET /tasks/analytics
Analytics des tâches

#### GET /tasks/urgent
Tâches urgentes

#### GET /tasks/categories
Catégories de tâches

## 📊 Analytics

### Endpoints analytics

#### GET /analytics/dashboard
Dashboard analytics complet

**Query Parameters:**
- `start` (date) - Date de début
- `end` (date) - Date de fin

**Response:**
```json
{
  "success": true,
  "data": {
    "generalMetrics": {
      "users": {
        "total": 1500,
        "active": 1200,
        "growth": 15.5
      },
      "tasks": {
        "total": 5000,
        "completed": 3500,
        "completionRate": 70
      },
      "financial": {
        "transactions": 2000,
        "volume": 50000,
        "averageTransaction": 25
      }
    },
    "geographicAnalytics": [
      {
        "location": "Paris",
        "count": 500,
        "latitude": 48.8566,
        "longitude": 2.3522
      }
    ],
    "temporalAnalytics": [
      {
        "period": "2023-12-01",
        "users": 25,
        "tasks": 50,
        "transactions": 30,
        "revenue": 750
      }
    ],
    "lastUpdated": "2023-12-01T10:00:00Z"
  }
}
```

#### GET /analytics/metrics
Métriques générales

#### GET /analytics/geographic
Analytics géographiques

#### GET /analytics/temporal
Analytics temporelles

#### GET /analytics/user-performance
Performance des utilisateurs

#### GET /analytics/fraud-detection
Détection de fraude

#### GET /analytics/revenue
Analytics de revenus

#### GET /analytics/engagement
Analytics d'engagement

#### GET /analytics/system-performance
Performance système

#### GET /analytics/real-time
Métriques temps réel

#### GET /analytics/trends
Tendances

#### GET /analytics/alerts
Alertes

#### POST /analytics/export
Exporter les analytics

**Body:**
```json
{
  "type": "analytics",
  "format": "csv",
  "start": "2023-01-01",
  "end": "2023-12-31"
}
```

## 🔧 Administration

### Endpoints admin

#### GET /health
Santé de l'application

#### GET /profile
Profil de l'admin connecté

#### PATCH /profile
Mettre à jour le profil

#### GET /system-info
Informations système (super admin uniquement)

#### GET /logs
Logs système (super admin uniquement)

#### GET /settings
Paramètres système (super admin uniquement)

#### PATCH /settings
Mettre à jour les paramètres (super admin uniquement)

## 🚨 Codes d'erreur

### Codes HTTP
- `200` - Succès
- `201` - Créé
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Accès refusé
- `404` - Non trouvé
- `429` - Trop de requêtes
- `500` - Erreur serveur

### Codes d'erreur personnalisés
- `LOGIN_FAILED` - Échec de connexion
- `REFRESH_TOKEN_INVALID` - Token de rafraîchissement invalide
- `USER_NOT_FOUND` - Utilisateur non trouvé
- `TASK_NOT_FOUND` - Tâche non trouvée
- `INSUFFICIENT_PERMISSIONS` - Permissions insuffisantes
- `VALIDATION_FAILED` - Validation échouée
- `RATE_LIMIT_EXCEEDED` - Limite de taux dépassée

## 📝 Exemples d'utilisation

### Connexion et récupération des utilisateurs

```bash
# 1. Connexion
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@entraide-universelle.com", "password": "admin_password_123"}'

# 2. Récupérer les utilisateurs avec le token
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Suspendre un utilisateur

```bash
curl -X POST http://localhost:3000/api/admin/users/user-123/suspend \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Spam", "duration": 86400000}'
```

### Récupérer les analytics

```bash
curl -X GET "http://localhost:3000/api/admin/analytics/dashboard?start=2023-01-01&end=2023-12-31" \
  -H "Authorization: Bearer <token>"
```

## 🔒 Sécurité

### Rate Limiting
- **Général** : 100 requêtes/15 minutes
- **Authentification** : 5 tentatives/15 minutes
- **Export** : 3 exports/heure
- **Recherche** : 30 recherches/minute

### Validation
Toutes les entrées sont validées avec Joi :
- Formats d'email
- Formats UUID
- Types de données
- Longueurs de chaînes
- Valeurs numériques

### Logs de sécurité
Toutes les actions sensibles sont loggées :
- Tentatives de connexion
- Changements de permissions
- Actions sur les utilisateurs
- Exports de données

## 📊 Monitoring

### Endpoints de santé
- `GET /health` - État général
- `GET /metrics` - Métriques Prometheus (restreint)

### Logs
- `logs/combined.log` - Tous les logs
- `logs/error.log` - Erreurs uniquement
- `logs/security.log` - Événements de sécurité

---

**Pour plus d'informations, consultez le README.md principal du projet.**
