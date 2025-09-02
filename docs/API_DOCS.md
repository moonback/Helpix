# 📚 Documentation API - Helpix

## 🎯 Vue d'Ensemble

L'API d'Helpix est construite sur **Supabase** et expose des endpoints RESTful pour toutes les fonctionnalités de la plateforme. Cette documentation couvre tous les endpoints disponibles, leurs paramètres, réponses et exemples d'utilisation.

## 🔐 Authentification

### **Base URL**
```
https://your-project.supabase.co/rest/v1/
```

### **Headers Requis**
```http
Authorization: Bearer <jwt_token>
apikey: <anon_key>
Content-Type: application/json
```

### **Authentification Supabase**
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
});

// Logout
await supabase.auth.signOut();
```

## 👤 Utilisateurs (Users)

### **GET /users**
Récupère les informations de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Réponse :**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "https://...",
  "phone": "+33123456789",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### **PUT /users**
Met à jour le profil utilisateur.

**Body :**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+33123456789",
  "avatar_url": "https://..."
}
```

**Réponse :**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+33123456789",
  "avatar_url": "https://...",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## 📋 Tâches (Tasks)

### **GET /tasks**
Récupère la liste des tâches avec filtres.

**Query Parameters :**
- `select` : Champs à récupérer
- `order` : Tri (ex: `created_at.desc`)
- `limit` : Nombre d'éléments (défaut: 20)
- `offset` : Décalage pour pagination
- `status` : Filtre par statut (`open`, `in_progress`, `completed`, `cancelled`)
- `category` : Filtre par catégorie
- `budget_min` : Budget minimum
- `budget_max` : Budget maximum
- `distance` : Distance maximale (km)
- `latitude` : Latitude pour géolocalisation
- `longitude` : Longitude pour géolocalisation

**Exemple :**
```http
GET /tasks?select=*&status=eq.open&order=created_at.desc&limit=10
```

**Réponse :**
```json
[
  {
    "id": "uuid",
    "title": "Aide pour déménagement",
    "description": "Besoin d'aide pour déménager mes affaires",
    "category": "demenagement",
    "status": "open",
    "budget_credits": 50,
    "latitude": 48.8566,
    "longitude": 2.3522,
    "address": "123 Rue de la Paix, Paris",
    "user_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user": {
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "https://..."
    }
  }
]
```

### **POST /tasks**
Crée une nouvelle tâche.

**Body :**
```json
{
  "title": "Aide pour déménagement",
  "description": "Besoin d'aide pour déménager mes affaires",
  "category": "demenagement",
  "budget_credits": 50,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "address": "123 Rue de la Paix, Paris"
}
```

**Réponse :**
```json
{
  "id": "uuid",
  "title": "Aide pour déménagement",
  "description": "Besoin d'aide pour déménager mes affaires",
  "category": "demenagement",
  "status": "open",
  "budget_credits": 50,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "address": "123 Rue de la Paix, Paris",
  "user_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### **GET /tasks/{id}**
Récupère une tâche spécifique.

**Réponse :**
```json
{
  "id": "uuid",
  "title": "Aide pour déménagement",
  "description": "Besoin d'aide pour déménager mes affaires",
  "category": "demenagement",
  "status": "open",
  "budget_credits": 50,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "address": "123 Rue de la Paix, Paris",
  "user_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "user": {
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": "https://..."
  }
}
```

### **PUT /tasks/{id}**
Met à jour une tâche.

**Body :**
```json
{
  "title": "Aide pour déménagement - URGENT",
  "description": "Besoin d'aide pour déménager mes affaires rapidement",
  "budget_credits": 75
}
```

### **DELETE /tasks/{id}**
Supprime une tâche.

**Réponse :**
```json
{
  "id": "uuid",
  "deleted": true
}
```

## 💰 Portefeuille (Wallet)

### **GET /wallets**
Récupère le portefeuille de l'utilisateur connecté.

**Réponse :**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "balance": 150.50,
  "total_earned": 500.00,
  "total_spent": 349.50,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### **GET /transactions**
Récupère l'historique des transactions.

**Query Parameters :**
- `order` : Tri (ex: `created_at.desc`)
- `limit` : Nombre d'éléments
- `type` : Type de transaction (`credit`, `debit`)

**Réponse :**
```json
[
  {
    "id": "uuid",
    "wallet_id": "uuid",
    "type": "credit",
    "amount": 50.00,
    "description": "Récompense pour tâche terminée",
    "reference_id": "task_uuid",
    "reference_type": "task_completion",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### **POST /transactions**
Crée une nouvelle transaction (pour les achats de crédits).

**Body :**
```json
{
  "type": "credit",
  "amount": 100.00,
  "description": "Achat de crédits",
  "reference_type": "credit_purchase"
}
```

## 💬 Messagerie (Messages)

### **GET /conversations**
Récupère la liste des conversations.

**Réponse :**
```json
[
  {
    "id": "uuid",
    "task_id": "uuid",
    "participant1_id": "uuid",
    "participant2_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "task": {
      "title": "Aide pour déménagement",
      "status": "open"
    },
    "other_participant": {
      "first_name": "Jane",
      "last_name": "Smith",
      "avatar_url": "https://..."
    },
    "last_message": {
      "content": "Salut ! Je peux t'aider avec ton déménagement",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
]
```

### **GET /messages**
Récupère les messages d'une conversation.

**Query Parameters :**
- `conversation_id` : ID de la conversation
- `order` : Tri (ex: `created_at.asc`)
- `limit` : Nombre d'éléments

**Réponse :**
```json
[
  {
    "id": "uuid",
    "conversation_id": "uuid",
    "sender_id": "uuid",
    "content": "Salut ! Je peux t'aider avec ton déménagement",
    "created_at": "2024-01-01T00:00:00Z",
    "sender": {
      "first_name": "Jane",
      "last_name": "Smith",
      "avatar_url": "https://..."
    }
  }
]
```

### **POST /messages**
Envoie un nouveau message.

**Body :**
```json
{
  "conversation_id": "uuid",
  "content": "Parfait ! Quand peux-tu venir ?"
}
```

**Réponse :**
```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "sender_id": "uuid",
  "content": "Parfait ! Quand peux-tu venir ?",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 🤝 Offres d'Aide (Help Offers)

### **GET /help_offers**
Récupère les offres d'aide.

**Query Parameters :**
- `task_id` : Filtre par tâche
- `status` : Statut de l'offre (`pending`, `accepted`, `rejected`)

**Réponse :**
```json
[
  {
    "id": "uuid",
    "task_id": "uuid",
    "helper_id": "uuid",
    "message": "Je peux t'aider avec ton déménagement",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z",
    "helper": {
      "first_name": "Jane",
      "last_name": "Smith",
      "avatar_url": "https://..."
    }
  }
]
```

### **POST /help_offers**
Crée une nouvelle offre d'aide.

**Body :**
```json
{
  "task_id": "uuid",
  "message": "Je peux t'aider avec ton déménagement"
}
```

### **PUT /help_offers/{id}**
Met à jour le statut d'une offre d'aide.

**Body :**
```json
{
  "status": "accepted"
}
```

## 📊 Statistiques et Analytics

### **GET /task_metrics**
Récupère les métriques des tâches.

**Query Parameters :**
- `user_id` : ID de l'utilisateur
- `period` : Période (`week`, `month`, `year`)

**Réponse :**
```json
{
  "total_tasks": 25,
  "completed_tasks": 20,
  "active_tasks": 3,
  "cancelled_tasks": 2,
  "total_earned": 500.00,
  "average_rating": 4.8,
  "completion_rate": 0.8
}
```

## 🔍 Recherche et Filtres

### **GET /tasks/search**
Recherche avancée de tâches.

**Query Parameters :**
- `q` : Terme de recherche
- `category` : Catégorie
- `budget_min` : Budget minimum
- `budget_max` : Budget maximum
- `latitude` : Latitude
- `longitude` : Longitude
- `radius` : Rayon de recherche (km)
- `sort` : Tri (`distance`, `budget`, `date`)

**Exemple :**
```http
GET /tasks/search?q=demenagement&category=demenagement&budget_min=20&budget_max=100&latitude=48.8566&longitude=2.3522&radius=10&sort=distance
```

## 📱 Géolocalisation

### **GET /geocoding/search**
Recherche d'adresses.

**Query Parameters :**
- `q` : Terme de recherche
- `limit` : Nombre de résultats

**Réponse :**
```json
[
  {
    "display_name": "123 Rue de la Paix, 75001 Paris, France",
    "lat": "48.8566",
    "lon": "2.3522",
    "address": {
      "house_number": "123",
      "road": "Rue de la Paix",
      "postcode": "75001",
      "city": "Paris",
      "country": "France"
    }
  }
]
```

### **GET /geocoding/reverse**
Géocodage inverse (coordonnées → adresse).

**Query Parameters :**
- `lat` : Latitude
- `lon` : Longitude

**Réponse :**
```json
{
  "display_name": "123 Rue de la Paix, 75001 Paris, France",
  "address": {
    "house_number": "123",
    "road": "Rue de la Paix",
    "postcode": "75001",
    "city": "Paris",
    "country": "France"
  }
}
```

## 🔄 Real-time Subscriptions

### **Abonnement aux Tâches**
```typescript
const subscription = supabase
  .channel('tasks')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'tasks' 
    },
    (payload) => {
      console.log('Task change:', payload);
    }
  )
  .subscribe();
```

### **Abonnement aux Messages**
```typescript
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      console.log('New message:', payload);
    }
  )
  .subscribe();
```

## ⚠️ Gestion des Erreurs

### **Codes d'Erreur HTTP**

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Ressource non trouvée |
| 409 | Conflit (ex: tâche déjà assignée) |
| 422 | Données invalides |
| 500 | Erreur serveur |

### **Format des Erreurs**
```json
{
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Crédits insuffisants pour créer cette tâche",
    "details": {
      "required": 50,
      "available": 25
    }
  }
}
```

## 🔒 Sécurité et Permissions

### **Row Level Security (RLS)**

Toutes les tables utilisent RLS pour garantir la sécurité :

- **Users** : Accès uniquement à son propre profil
- **Tasks** : Lecture publique, écriture limitée au créateur
- **Messages** : Accès limité aux participants de la conversation
- **Wallets** : Accès uniquement à son propre portefeuille

### **Validation des Données**

Toutes les entrées sont validées côté serveur :
- Types de données
- Longueur des chaînes
- Formats (email, téléphone)
- Contraintes métier (budget positif, etc.)

## 📈 Rate Limiting

### **Limites par Endpoint**

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| POST /tasks | 10 | 1 heure |
| POST /messages | 100 | 1 heure |
| GET /tasks | 1000 | 1 heure |
| POST /help_offers | 20 | 1 heure |

### **Headers de Rate Limiting**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🧪 Exemples d'Intégration

### **JavaScript/TypeScript**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Créer une tâche
const createTask = async (taskData: CreateTaskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Récupérer les tâches avec filtres
const getTasks = async (filters: TaskFilters) => {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('status', 'open');
    
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.budget_min) {
    query = query.gte('budget_credits', filters.budget_min);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (error) throw error;
  return data;
};
```

### **cURL**
```bash
# Créer une tâche
curl -X POST 'https://your-project.supabase.co/rest/v1/tasks' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aide pour déménagement",
    "description": "Besoin d aide pour déménager",
    "category": "demenagement",
    "budget_credits": 50,
    "latitude": 48.8566,
    "longitude": 2.3522,
    "address": "123 Rue de la Paix, Paris"
  }'

# Récupérer les tâches
curl -X GET 'https://your-project.supabase.co/rest/v1/tasks?select=*&status=eq.open&order=created_at.desc' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY"
```

---

Cette documentation API couvre tous les endpoints disponibles dans Helpix. Pour toute question ou clarification, consultez les exemples d'utilisation ou contactez l'équipe de développement.
