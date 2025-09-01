# 📚 Documentation API - Entraide Universelle

## 🎯 Vue d'ensemble

L'application Entraide Universelle utilise **Supabase** comme backend-as-a-service (BaaS), fournissant une API REST complète avec authentification robuste, base de données PostgreSQL relationnelle, et fonctionnalités temps réel avancées.

### **Architecture API**
- **Base URL** : `https://votre-projet.supabase.co/rest/v1/`
- **Authentification** : JWT tokens avec auto-refresh
- **Format** : JSON avec support TypeScript complet
- **Real-time** : WebSocket subscriptions natives
- **Sécurité** : Row Level Security (RLS) granulaire

## 🔐 Authentification

### **Configuration du Client**

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);
```

### **Endpoints d'Authentification**

#### **1. Inscription Utilisateur**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123',
  options: {
    data: {
      name: 'John Doe',
    },
  },
});
```

**Réponse :**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": {
        "name": "John Doe"
      }
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  },
  "error": null
}
```

#### **2. Connexion Utilisateur**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123',
});
```

#### **3. Déconnexion**
```typescript
const { error } = await supabase.auth.signOut();
```

#### **4. Récupération de Session**
```typescript
const { data: { session }, error } = await supabase.auth.getSession();
```

#### **5. Écoute des Changements d'Authentification**
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event);
    console.log('Session:', session);
  }
);
```

### **Gestion des Sessions**

#### **Configuration des Cookies**
```typescript
cookieOptions: {
  name: 'entraide-universelle-session',
  lifetime: 60 * 60 * 24 * 7, // 7 jours
  domain: undefined,
  path: '/',
  secure: import.meta.env.PROD,
  httpOnly: false,
  sameSite: 'lax',
}
```

#### **Rafraîchissement Automatique des Tokens**
- `autoRefreshToken: true` - Rafraîchit automatiquement les tokens expirés
- `persistSession: true` - Persiste la session dans le localStorage
- `detectSessionInUrl: true` - Détecte les sessions dans l'URL

## 🗄️ Base de Données

### **Tables Principales**

#### **1. Table `users`**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  credits INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Opérations CRUD :**

```typescript
// Créer un utilisateur
const { data, error } = await supabase
  .from('users')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Passionné d\'entraide',
    location: 'Paris, France',
    credits: 100
  });

// Récupérer un utilisateur
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

// Mettre à jour un utilisateur
const { data, error } = await supabase
  .from('users')
  .update({
    bio: 'Nouvelle bio',
    location: 'Lyon, France'
  })
  .eq('id', userId);

// Supprimer un utilisateur
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);
```

#### **2. Table `tasks`**

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('local','remote')) DEFAULT 'local',
  status TEXT CHECK (status IN ('open','in_progress','completed','cancelled')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  estimated_duration INTEGER NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  required_skills TEXT[] DEFAULT '{}',
  budget_credits INTEGER NOT NULL DEFAULT 0,
  deadline TIMESTAMP,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  assigned_to UUID REFERENCES users(id),
  completion_date TIMESTAMP,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT
);
```

**Opérations CRUD :**

```typescript
// Créer une tâche
const { data, error } = await supabase
  .from('tasks')
  .insert({
    user_id: currentUserId,
    title: 'Aide pour déménagement',
    description: 'Besoin d\'aide pour déménager',
    category: 'local',
    priority: 'high',
    estimated_duration: 4,
    location: 'Paris 11ème',
    latitude: 48.8566,
    longitude: 2.3522,
    required_skills: ['Déménagement', 'Force physique'],
    budget_credits: 80,
    tags: ['déménagement', 'urgent']
  });

// Récupérer toutes les tâches
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .order('created_at', { ascending: false });

// Récupérer les tâches d'un utilisateur
const { data: userTasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId);

// Rechercher des tâches
const { data: searchResults, error } = await supabase
  .from('tasks')
  .select('*')
  .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

// Filtrer par catégorie
const { data: localTasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('category', 'local');

// Filtrer par priorité
const { data: urgentTasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('priority', 'urgent');

// Mettre à jour une tâche
const { data, error } = await supabase
  .from('tasks')
  .update({
    status: 'in_progress',
    assigned_to: helperUserId,
    updated_at: new Date().toISOString()
  })
  .eq('id', taskId);

// Supprimer une tâche
const { error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

#### **3. Table `skills`**

```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL
);
```

**Opérations :**

```typescript
// Ajouter une compétence
const { data, error } = await supabase
  .from('skills')
  .insert({
    user_id: currentUserId,
    skill_name: 'Jardinage'
  });

// Récupérer les compétences d'un utilisateur
const { data: skills, error } = await supabase
  .from('skills')
  .select('*')
  .eq('user_id', userId);
```

#### **4. Table `items`**

```sql
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT TRUE
);
```

#### **5. Table `transactions`**

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL,
  task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Opérations :**

```typescript
// Créer une transaction
const { data, error } = await supabase
  .from('transactions')
  .insert({
    sender_id: helperUserId,
    receiver_id: taskOwnerId,
    credits: 50,
    task_id: taskId
  });

// Récupérer l'historique des transactions
const { data: transactions, error } = await supabase
  .from('transactions')
  .select('*')
  .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
  .order('created_at', { ascending: false });
```

#### **6. Table `messages`**

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Opérations :**

```typescript
// Envoyer un message
const { data, error } = await supabase
  .from('messages')
  .insert({
    sender_id: currentUserId,
    receiver_id: recipientId,
    content: 'Bonjour ! Je peux vous aider.'
  });

// Récupérer la conversation
const { data: messages, error } = await supabase
  .from('messages')
  .select('*')
  .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
  .order('created_at', { ascending: true });
```

### **Politiques de Sécurité (RLS)**

#### **Activation du RLS**
```sql
-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

#### **Politiques pour `users`**
```sql
-- Les utilisateurs peuvent voir tous les profils
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Les utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "Users can delete own profile" ON users
  FOR DELETE USING (auth.uid() = id);
```

#### **Politiques pour `tasks`**
```sql
-- Tout le monde peut voir les tâches
CREATE POLICY "Anyone can view tasks" ON tasks
  FOR SELECT USING (true);

-- Les utilisateurs peuvent créer leurs propres tâches
CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres tâches
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres tâches
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

#### **Politiques pour `transactions`**
```sql
-- Les utilisateurs peuvent voir leurs transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Les utilisateurs peuvent créer des transactions
CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

## 🔄 Fonctionnalités Temps Réel

### **Abonnements aux Changements**

#### **1. Abonnement aux Tâches**
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
      console.log('Change received!', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          // Nouvelle tâche créée
          break;
        case 'UPDATE':
          // Tâche modifiée
          break;
        case 'DELETE':
          // Tâche supprimée
          break;
      }
    }
  )
  .subscribe();
```

#### **2. Abonnement aux Messages**
```typescript
const subscription = supabase
  .channel('messages')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${currentUserId}`
    },
    (payload) => {
      // Nouveau message reçu
      console.log('Nouveau message:', payload.new);
    }
  )
  .subscribe();
```

#### **3. Abonnement aux Transactions**
```typescript
const subscription = supabase
  .channel('transactions')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'transactions',
      filter: `or(sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId})`
    },
    (payload) => {
      // Nouvelle transaction
      console.log('Nouvelle transaction:', payload.new);
    }
  )
  .subscribe();
```

### **Gestion des Canaux**

#### **Nettoyage des Abonnements**
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('tasks')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tasks' },
      handleTaskChange
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## 📁 Stockage de Fichiers

### **Buckets de Stockage**

#### **1. Configuration des Buckets**
```sql
-- Créer un bucket pour les avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Créer un bucket pour les images de tâches
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-images', 'task-images', true);
```

#### **2. Politiques de Stockage**
```sql
-- Politique pour les avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

#### **3. Opérations de Fichiers**

**Upload d'Avatar :**
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file, {
    cacheControl: '3600',
    upsert: true
  });
```

**Récupération d'Avatar :**
```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`);

const avatarUrl = data.publicUrl;
```

**Suppression de Fichier :**
```typescript
const { error } = await supabase.storage
  .from('avatars')
  .remove([`${userId}/avatar.jpg`]);
```

## 🔍 Requêtes Avancées

### **Requêtes avec Jointures**

#### **1. Tâches avec Informations Utilisateur**
```typescript
const { data: tasksWithUsers, error } = await supabase
  .from('tasks')
  .select(`
    *,
    users!inner (
      id,
      name,
      avatar_url,
      credits
    )
  `)
  .eq('status', 'open')
  .order('created_at', { ascending: false });
```

#### **2. Tâches avec Compétences Requises**
```typescript
const { data: tasksWithSkills, error } = await supabase
  .from('tasks')
  .select(`
    *,
    users (
      id,
      name,
      avatar_url
    )
  `)
  .contains('required_skills', ['Jardinage'])
  .eq('category', 'local');
```

### **Requêtes Géospatiales**

#### **1. Tâches dans un Rayon**
```typescript
// Utiliser PostGIS pour les requêtes géospatiales
const { data: nearbyTasks, error } = await supabase
  .rpc('get_tasks_within_radius', {
    user_lat: userLatitude,
    user_lon: userLongitude,
    radius_km: 10
  });
```

**Fonction PostGIS :**
```sql
CREATE OR REPLACE FUNCTION get_tasks_within_radius(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION
)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  description TEXT,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(t.latitude)) * 
        cos(radians(t.longitude) - radians(user_lon)) + 
        sin(radians(user_lat)) * 
        sin(radians(t.latitude))
      )
    ) AS distance
  FROM tasks t
  WHERE t.latitude IS NOT NULL 
    AND t.longitude IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(t.latitude)) * 
        cos(radians(t.longitude) - radians(user_lon)) + 
        sin(radians(user_lat)) * 
        sin(radians(t.latitude))
      )
    ) <= radius_km
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;
```

### **Requêtes avec Agrégations**

#### **1. Statistiques Utilisateur**
```typescript
const { data: userStats, error } = await supabase
  .from('tasks')
  .select(`
    status,
    priority,
    budget_credits
  `)
  .eq('user_id', userId);

// Traitement côté client
const stats = {
  totalTasks: userStats.length,
  completedTasks: userStats.filter(t => t.status === 'completed').length,
  totalEarned: userStats
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.budget_credits, 0),
  urgentTasks: userStats.filter(t => t.priority === 'urgent').length
};
```

## 🚀 Optimisation des Performances

### **Stratégies d'Optimisation**

#### **1. Indexation**
```sql
-- Index sur les colonnes fréquemment utilisées
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Index géospatial
CREATE INDEX idx_tasks_location ON tasks USING GIST (
  ll_to_earth(latitude, longitude)
);

-- Index sur les tableaux
CREATE INDEX idx_tasks_required_skills ON tasks USING GIN(required_skills);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
```

#### **2. Pagination**
```typescript
const ITEMS_PER_PAGE = 20;

const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)
  .order('created_at', { ascending: false });
```

#### **3. Sélection de Colonnes**
```typescript
// Sélectionner uniquement les colonnes nécessaires
const { data: taskSummaries, error } = await supabase
  .from('tasks')
  .select('id, title, category, priority, created_at')
  .eq('status', 'open')
  .limit(10);
```

## 🔒 Gestion des Erreurs

### **Types d'Erreurs Supabase**

#### **1. Erreurs d'Authentification**
```typescript
if (error?.message === 'Invalid login credentials') {
  // Identifiants invalides
} else if (error?.message === 'Email not confirmed') {
  // Email non confirmé
} else if (error?.message === 'User already registered') {
  // Utilisateur déjà inscrit
}
```

#### **2. Erreurs de Base de Données**
```typescript
if (error?.code === '23505') {
  // Violation de contrainte unique
} else if (error?.code === '23503') {
  // Violation de clé étrangère
} else if (error?.code === '42P01') {
  // Table inexistante
}
```

#### **3. Gestion Globale des Erreurs**
```typescript
const handleSupabaseError = (error: any) => {
  if (error?.code === 'PGRST301') {
    // Erreur de pagination
    console.error('Erreur de pagination:', error.message);
  } else if (error?.code === 'PGRST302') {
    // Erreur de filtrage
    console.error('Erreur de filtrage:', error.message);
  } else {
    // Erreur générique
    console.error('Erreur Supabase:', error.message);
  }
};
```

## 📊 Monitoring et Logs

### **Logs de Requêtes**

#### **1. Activation des Logs**
```sql
-- Activer les logs de requêtes
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_min_duration_statement = 1000;
```

#### **2. Métriques de Performance**
```typescript
// Mesurer le temps de réponse des requêtes
const startTime = performance.now();

const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'open');

const endTime = performance.now();
const duration = endTime - startTime;

console.log(`Requête exécutée en ${duration}ms`);
```

## 🔮 Évolutions Futures

### **Fonctionnalités API Prévues**

#### **1. GraphQL**
- API unifiée et flexible
- Requêtes optimisées
- Schema-first development

#### **2. Webhooks**
- Notifications en temps réel
- Intégrations tierces
- Automatisation des processus

#### **3. API Rate Limiting**
- Protection contre l'abus
- Quotas par utilisateur
- Monitoring des utilisations

---

**Cette documentation couvre l'ensemble des fonctionnalités API disponibles dans l'application Entraide Universelle.**
