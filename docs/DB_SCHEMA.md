# 🗄️ Schéma de Base de Données - Entraide Universelle

## Vue d'ensemble

La base de données Entraide Universelle utilise **PostgreSQL** hébergé sur Supabase avec une architecture relationnelle optimisée pour les applications d'entraide et de partage de compétences.

## 🏗️ Architecture de la Base

### **Diagramme ERD (Entity Relationship Diagram)**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    users    │    │    tasks    │    │ transactions│
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │◄───│ user_id (FK)│    │ sender_id(FK)│
│ name        │    │ title       │    │ receiver_id │
│ email       │    │ description │    │ credits     │
│ bio         │    │ category    │    │ task_id (FK)│
│ location    │    │ status      │    │ created_at  │
│ credits     │    │ priority    │    └─────────────┘
│ created_at  │    │ location    │
└─────────────┘    │ latitude    │    ┌─────────────┐
                   │ longitude   │    │   messages  │
┌─────────────┐    │ skills[]    │    ├─────────────┤
│   skills    │    │ tags[]      │    │ conversation_id(FK)│
├─────────────┤    │ budget      │    │ sender_id(FK)│
│ user_id (FK)│◄───│ deadline    │    │ receiver_id │
│ skill_name  │    │ assigned_to │    │ content     │
└─────────────┘    │ rating      │    │ type        │
                   └─────────────┘    │ timestamp   │
┌─────────────┐                       │ isRead      │
│    items    │                       └─────────────┘
├─────────────┤                       │
│ user_id (FK)│                       ┌─────────────┐
│ item_name   │                       │conversations│
│ description │                       ├─────────────┤
│ available   │                       │ id (PK)     │
└─────────────┘                       │ created_at  │
                                      │ updated_at  │
                                      └─────────────┘
                                              │
                                              │
                                      ┌─────────────┐
                                      │conversation_│
                                      │participants │
                                      ├─────────────┤
                                      │conversation_id(FK)│
                                      │ user_id (FK)│
                                      └─────────────┘

┌─────────────┐
│ attachments │
├─────────────┤
│ id (PK)     │
│ message_id(FK)│
│ file_name   │
│ file_url    │
│ file_type   │
│ file_size   │
│ uploaded_at │
└─────────────┘
```

### **Relations Clés**

- **users** → **tasks** : Un utilisateur peut créer plusieurs tâches (1:N)
- **users** → **skills** : Un utilisateur peut avoir plusieurs compétences (1:N)
- **users** → **items** : Un utilisateur peut prêter plusieurs objets (1:N)
- **users** → **transactions** : Un utilisateur peut être expéditeur ou destinataire (N:N)
- **conversations** → **conversation_participants** : Une conversation peut avoir plusieurs participants (1:N)
- **conversations** → **messages** : Une conversation peut contenir plusieurs messages (1:N)
- **messages** → **attachments** : Un message peut avoir plusieurs pièces jointes (1:N)
- **tasks** → **transactions** : Une tâche peut générer plusieurs transactions (1:N)

## 📋 Tables Détaillées

### **1. Table `users` - Utilisateurs**

**Description :** Stocke les informations des utilisateurs de la plateforme.

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

**Colonnes :**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique de l'utilisateur |
| `name` | TEXT | NOT NULL | Nom complet de l'utilisateur |
| `email` | TEXT | UNIQUE, NOT NULL | Adresse email unique |
| `password_hash` | TEXT | NOT NULL | Hash du mot de passe (géré par Supabase Auth) |
| `avatar_url` | TEXT | NULL | URL de l'avatar de l'utilisateur |
| `bio` | TEXT | NULL | Biographie de l'utilisateur |
| `location` | TEXT | NULL | Localisation textuelle (ville, quartier) |
| `credits` | INTEGER | DEFAULT 100 | Solde de crédits d'entraide |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création du compte |

**Index recommandés :**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Politiques RLS :**
```sql
-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON users
  FOR DELETE USING (auth.uid() = id);
```

### **2. Table `tasks` - Tâches**

**Description :** Stocke les demandes d'aide et offres de service des utilisateurs.

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

**Colonnes :**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identifiant unique de la tâche |
| `user_id` | UUID | FOREIGN KEY | Créateur de la tâche |
| `title` | TEXT | NOT NULL | Titre de la tâche |
| `description` | TEXT | NOT NULL | Description détaillée |
| `category` | TEXT | CHECK | Type : 'local' ou 'remote' |
| `status` | TEXT | CHECK | Statut : 'open', 'in_progress', 'completed', 'cancelled' |
| `priority` | TEXT | CHECK | Priorité : 'low', 'medium', 'high', 'urgent' |
| `estimated_duration` | INTEGER | NOT NULL | Durée estimée en heures |
| `location` | TEXT | NOT NULL | Adresse textuelle |
| `latitude` | NUMERIC(10,8) | NULL | Coordonnée GPS latitude |
| `longitude` | NUMERIC(11,8) | NULL | Coordonnée GPS longitude |
| `required_skills` | TEXT[] | DEFAULT '{}' | Compétences requises (tableau) |
| `budget_credits` | INTEGER | DEFAULT 0 | Récompense en crédits |
| `deadline` | TIMESTAMP | NULL | Date limite optionnelle |
| `tags` | TEXT[] | DEFAULT '{}' | Tags de catégorisation |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Date de dernière modification |
| `assigned_to` | UUID | FOREIGN KEY | Utilisateur assigné (optionnel) |
| `completion_date` | TIMESTAMP | NULL | Date de completion |
| `rating` | INTEGER | CHECK 1-5 | Note de satisfaction |
| `feedback` | TEXT | NULL | Commentaire de satisfaction |

**Index recommandés :**
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- Index géospatial (si PostGIS disponible)
CREATE INDEX idx_tasks_location ON tasks USING GIST (
  ll_to_earth(latitude, longitude)
);

-- Index sur les tableaux
CREATE INDEX idx_tasks_required_skills ON tasks USING GIN(required_skills);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
```

**Politiques RLS :**
```sql
-- Activer RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Anyone can view tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Assigned users can update tasks" ON tasks
  FOR UPDATE USING (auth.uid() = assigned_to);
```

**Triggers :**
```sql
-- Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### **3. Table `skills` - Compétences**

**Description :** Stocke les compétences des utilisateurs.

```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL
);
```

**Colonnes :**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identifiant unique de la compétence |
| `user_id` | UUID | FOREIGN KEY | Utilisateur propriétaire |
| `skill_name` | TEXT | NOT NULL | Nom de la compétence |

**Index recommandés :**
```sql
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_skill_name ON skills(skill_name);
```

**Politiques RLS :**
```sql
-- Activer RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Anyone can view skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own skills" ON skills
  FOR ALL USING (auth.uid() = user_id);
```

### **4. Table `items` - Objets Prêtables**

**Description :** Stocke les objets que les utilisateurs peuvent prêter.

```sql
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT TRUE
);
```

**Colonnes :**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identifiant unique de l'objet |
| `user_id` | UUID | FOREIGN KEY | Propriétaire de l'objet |
| `item_name` | TEXT | NOT NULL | Nom de l'objet |
| `description` | TEXT | NULL | Description de l'objet |
| `available` | BOOLEAN | DEFAULT TRUE | Disponibilité de l'objet |

**Index recommandés :**
```sql
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_available ON items(available);
```

**Politiques RLS :**
```sql
-- Activer RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Anyone can view items" ON items
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own items" ON items
  FOR ALL USING (auth.uid() = user_id);
```

### **5. Table `transactions` - Transactions de Crédits**

**Description :** Stocke l'historique des échanges de crédits entre utilisateurs.

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

**Colonnes :**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identifiant unique de la transaction |
| `sender_id` | UUID | FOREIGN KEY | Utilisateur qui envoie les crédits |
| `receiver_id` | UUID | FOREIGN KEY | Utilisateur qui reçoit les crédits |
| `credits` | INTEGER | NOT NULL | Montant de crédits transférés |
| `task_id` | INTEGER | FOREIGN KEY | Tâche associée (optionnelle) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de la transaction |

**Index recommandés :**
```sql
CREATE INDEX idx_transactions_sender_id ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver_id ON transactions(receiver_id);
CREATE INDEX idx_transactions_task_id ON transactions(task_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

**Politiques RLS :**
```sql
-- Activer RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

### **6. Table `messages` - Messages**

**Description :** Stocke les messages des conversations entre utilisateurs.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'image', 'file')) DEFAULT 'text',
  timestamp TIMESTAMP DEFAULT NOW(),
  isRead BOOLEAN DEFAULT FALSE
);
```

**Colonnes :**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique du message |
| `conversation_id` | UUID | FOREIGN KEY | Conversation à laquelle appartient le message |
| `sender_id` | UUID | FOREIGN KEY | Expéditeur du message |
| `receiver_id` | UUID | FOREIGN KEY | Destinataire du message |
| `content` | TEXT | NOT NULL | Contenu du message (texte, URL d'image, etc.) |
| `type` | TEXT | CHECK | Type : 'text', 'image', 'file' |
| `timestamp` | TIMESTAMP | DEFAULT NOW() | Date d'envoi |
| `isRead` | BOOLEAN | DEFAULT FALSE | Statut de lecture |

**Index recommandés :**
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_conversation_timestamp ON messages(conversation_id, timestamp);
```

**Politiques RLS :**
```sql
-- Activer RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM conversation_participants 
      WHERE conversation_id = messages.conversation_id
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);
```

### **7. Table `conversations` - Conversations**

**Description :** Stocke les conversations entre utilisateurs.

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Colonnes :**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique de la conversation |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Date de dernière modification |

**Index recommandés :**
```sql
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);
```

**Politiques RLS :**
```sql
-- Activer RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM conversation_participants 
      WHERE conversation_id = conversations.id
    )
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);
```

### **8. Table `conversation_participants` - Participants aux Conversations**

**Description :** Stocke les participants de chaque conversation (relation many-to-many).

```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);
```

**Colonnes :**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique de la participation |
| `conversation_id` | UUID | FOREIGN KEY | Conversation |
| `user_id` | UUID | FOREIGN KEY | Participant |
| `joined_at` | TIMESTAMP | DEFAULT NOW() | Date d'ajout à la conversation |

**Index recommandés :**
```sql
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE UNIQUE INDEX idx_conversation_participants_unique ON conversation_participants(conversation_id, user_id);
```

**Politiques RLS :**
```sql
-- Activer RLS
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Users can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
    )
  );

CREATE POLICY "Users can add themselves to conversations" ON conversation_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### **9. Table `attachments` - Pièces Jointes**

**Description :** Stocke les pièces jointes des messages (images, fichiers).

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

**Colonnes :**
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique de la pièce jointe |
| `message_id` | UUID | FOREIGN KEY | Message auquel est attaché le fichier |
| `file_name` | TEXT | NOT NULL | Nom original du fichier |
| `file_url` | TEXT | NOT NULL | URL du fichier dans le stockage |
| `file_type` | TEXT | NOT NULL | Type MIME du fichier |
| `file_size` | INTEGER | NOT NULL | Taille du fichier en bytes |
| `uploaded_at` | TIMESTAMP | DEFAULT NOW() | Date d'upload |

**Index recommandés :**
```sql
CREATE INDEX idx_attachments_message_id ON attachments(message_id);
CREATE INDEX idx_attachments_file_type ON attachments(file_type);
CREATE INDEX idx_attachments_uploaded_at ON attachments(uploaded_at);
```

**Politiques RLS :**
```sql
-- Activer RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Users can view attachments in their conversations" ON attachments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT cp.user_id FROM conversation_participants cp
      JOIN messages m ON m.conversation_id = cp.conversation_id
      WHERE m.id = attachments.message_id
    )
  );

CREATE POLICY "Users can upload attachments to their messages" ON attachments
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT sender_id FROM messages WHERE id = attachments.message_id
    )
  );
```

## 🔐 Sécurité et Contraintes

### **Contraintes de Validation**

#### **1. Contraintes sur les Énumérations**
```sql
-- Vérifier que les catégories sont valides
ALTER TABLE tasks ADD CONSTRAINT check_category 
  CHECK (category IN ('local', 'remote'));

-- Vérifier que les statuts sont valides
ALTER TABLE tasks ADD CONSTRAINT check_status 
  CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'));

-- Vérifier que les priorités sont valides
ALTER TABLE tasks ADD CONSTRAINT check_priority 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Vérifier que les notes sont dans la plage 1-5
ALTER TABLE tasks ADD CONSTRAINT check_rating 
  CHECK (rating >= 1 AND rating <= 5);
```

#### **2. Contraintes de Cohérence**
```sql
-- Vérifier que la date de completion est après la création
ALTER TABLE tasks ADD CONSTRAINT check_completion_date 
  CHECK (completion_date IS NULL OR completion_date >= created_at);

-- Vérifier que la deadline est dans le futur
ALTER TABLE tasks ADD CONSTRAINT check_deadline 
  CHECK (deadline IS NULL OR deadline > created_at);

-- Vérifier que les coordonnées GPS sont valides
ALTER TABLE tasks ADD CONSTRAINT check_coordinates 
  CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude IS NOT NULL AND longitude IS NOT NULL AND
     latitude BETWEEN -90 AND 90 AND
     longitude BETWEEN -180 AND 180)
  );
```

### **Triggers de Validation**

#### **1. Vérification des Crédits**
```sql
-- Fonction pour vérifier que l'utilisateur a assez de crédits
CREATE OR REPLACE FUNCTION check_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que l'expéditeur a assez de crédits
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = NEW.sender_id AND credits < NEW.credits
  ) THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger avant insertion de transaction
CREATE TRIGGER check_credits_before_transaction
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION check_user_credits();
```

#### **2. Mise à Jour Automatique des Crédits**
```sql
-- Fonction pour mettre à jour les crédits après transaction
CREATE OR REPLACE FUNCTION update_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Déduire les crédits de l'expéditeur
  UPDATE users 
  SET credits = credits - NEW.credits
  WHERE id = NEW.sender_id;
  
  -- Ajouter les crédits au destinataire
  UPDATE users 
  SET credits = credits + NEW.credits
  WHERE id = NEW.receiver_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger après insertion de transaction
CREATE TRIGGER update_credits_after_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_credits();
```

## 📊 Vues et Fonctions Utiles

### **1. Vue des Tâches avec Informations Utilisateur**

```sql
CREATE VIEW tasks_with_users AS
SELECT 
  t.*,
  u.name as creator_name,
  u.avatar_url as creator_avatar,
  u.credits as creator_credits,
  a.name as assignee_name,
  a.avatar_url as assignee_avatar
FROM tasks t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN users a ON t.assigned_to = a.id;
```

### **2. Vue des Statistiques Utilisateur**

```sql
CREATE VIEW user_stats AS
SELECT 
  u.id,
  u.name,
  u.credits,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.status = 'open' THEN 1 END) as open_tasks,
  COUNT(CASE WHEN t.priority = 'urgent' THEN 1 END) as urgent_tasks,
  COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.budget_credits END), 0) as total_earned,
  COALESCE(SUM(CASE WHEN t.status = 'open' THEN t.budget_credits END), 0) as total_offered
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.name, u.credits;
```

### **3. Fonction de Recherche Géospatiale**

```sql
CREATE OR REPLACE FUNCTION get_tasks_within_radius(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION,
  max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  description TEXT,
  category TEXT,
  priority TEXT,
  distance DOUBLE PRECISION,
  creator_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.category,
    t.priority,
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(t.latitude)) * 
        cos(radians(t.longitude) - radians(user_lon)) + 
        sin(radians(user_lat)) * 
        sin(radians(t.latitude))
      )
    ) AS distance,
    u.name as creator_name
  FROM tasks t
  JOIN users u ON t.user_id = u.id
  WHERE t.latitude IS NOT NULL 
    AND t.longitude IS NOT NULL
    AND t.status = 'open'
    AND (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(t.latitude)) * 
        cos(radians(t.longitude) - radians(user_lon)) + 
        sin(radians(user_lat)) * 
        sin(radians(t.latitude))
      )
    ) <= radius_km
  ORDER BY distance
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
```

### **4. Fonction de Recherche Textuelle**

```sql
CREATE OR REPLACE FUNCTION search_tasks(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  priority_filter TEXT DEFAULT NULL,
  max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  description TEXT,
  category TEXT,
  priority TEXT,
  relevance_score INTEGER,
  creator_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.category,
    t.priority,
    (
      CASE WHEN t.title ILIKE '%' || search_query || '%' THEN 10 ELSE 0 END +
      CASE WHEN t.description ILIKE '%' || search_query || '%' THEN 5 ELSE 0 END +
      CASE WHEN search_query = ANY(t.required_skills) THEN 8 ELSE 0 END +
      CASE WHEN search_query = ANY(t.tags) THEN 6 ELSE 0 END
    ) as relevance_score,
    u.name as creator_name
  FROM tasks t
  JOIN users u ON t.user_id = u.id
  WHERE t.status = 'open'
    AND (
      t.title ILIKE '%' || search_query || '%' OR
      t.description ILIKE '%' || search_query || '%' OR
      search_query = ANY(t.required_skills) OR
      search_query = ANY(t.tags)
    )
    AND (category_filter IS NULL OR t.category = category_filter)
    AND (priority_filter IS NULL OR t.priority = priority_filter)
  ORDER BY relevance_score DESC, t.created_at DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
```

## 🔄 Migrations et Évolutions

### **1. Script de Création Initiale**

```sql
-- Créer l'extension uuid-ossp si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer les tables dans l'ordre des dépendances
-- (voir les CREATE TABLE ci-dessus)

-- Créer les index
-- (voir les CREATE INDEX ci-dessus)

-- Créer les contraintes
-- (voir les ALTER TABLE ci-dessus)

-- Créer les triggers
-- (voir les CREATE TRIGGER ci-dessus)

-- Créer les vues et fonctions
-- (voir les CREATE VIEW et CREATE FUNCTION ci-dessus)

-- Activer RLS sur toutes les tables
-- (voir les ALTER TABLE ENABLE ROW LEVEL SECURITY ci-dessus)

-- Créer les politiques RLS
-- (voir les CREATE POLICY ci-dessus)
```

### **2. Script de Migration V1.1**

```sql
-- Ajouter de nouvelles colonnes si nécessaire
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS contact_preference TEXT CHECK (contact_preference IN ('chat', 'phone', 'email'));

-- Ajouter de nouveaux index
CREATE INDEX IF NOT EXISTS idx_tasks_estimated_cost ON tasks(estimated_cost);
CREATE INDEX IF NOT EXISTS idx_tasks_contact_preference ON tasks(contact_preference);

-- Mettre à jour les contraintes existantes
-- (ajouter de nouvelles contraintes si nécessaire)
```

## 📈 Performance et Optimisation

### **1. Configuration PostgreSQL**

```sql
-- Optimisations pour les applications web
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

### **2. Maintenance Automatique**

```sql
-- Créer une fonction de maintenance
CREATE OR REPLACE FUNCTION maintenance_cleanup()
RETURNS void AS $$
BEGIN
  -- Nettoyer les anciennes tâches annulées
  DELETE FROM tasks 
  WHERE status = 'cancelled' 
    AND created_at < NOW() - INTERVAL '6 months';
  
  -- Nettoyer les anciens messages
  DELETE FROM messages 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Mettre à jour les statistiques
  ANALYZE;
  VACUUM;
END;
$$ LANGUAGE plpgsql;

-- Programmer la maintenance (via pg_cron si disponible)
-- SELECT cron.schedule('maintenance', '0 2 * * *', 'SELECT maintenance_cleanup();');
```

## 🔍 Monitoring et Observabilité

### **1. Vues de Monitoring**

```sql
-- Vue des performances des requêtes
CREATE VIEW query_performance AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC;

-- Vue de l'utilisation des tables
CREATE VIEW table_usage AS
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### **2. Alertes et Notifications**

```sql
-- Fonction pour détecter les anomalies
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE (
  metric TEXT,
  value NUMERIC,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'total_users'::TEXT,
    COUNT(*)::NUMERIC,
    CASE WHEN COUNT(*) > 10000 THEN 'warning' ELSE 'ok' END
  FROM users
  UNION ALL
  SELECT 
    'open_tasks'::TEXT,
    COUNT(*)::NUMERIC,
    CASE WHEN COUNT(*) > 1000 THEN 'warning' ELSE 'ok' END
  FROM tasks
  WHERE status = 'open';
END;
$$ LANGUAGE plpgsql;
```

---

**Ce schéma de base de données est conçu pour être scalable, performant et sécurisé, tout en maintenant la flexibilité nécessaire pour les évolutions futures de l'application.**
