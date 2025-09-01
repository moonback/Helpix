# 🗄️ Schéma de Base de Données - Entraide Universelle

## 🎯 Vue d'ensemble

La base de données Entraide Universelle utilise **PostgreSQL 15+** hébergé sur Supabase avec une architecture relationnelle moderne, optimisée pour les applications d'entraide collaborative.

### **Caractéristiques Techniques**
- **SGBD** : PostgreSQL 15+ avec extensions avancées
- **Sécurité** : Row Level Security (RLS) sur toutes les tables
- **Performance** : Index optimisés et requêtes géospatiales
- **Scalabilité** : Design pour millions d'utilisateurs
- **Real-time** : Synchronisation temps réel native

## 🏗️ Architecture de la Base

### **Diagramme ERD (Entity Relationship Diagram)**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    users    │    │    tasks    │    │ transactions│
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │◄───│ user_id (FK)│    │ wallet_id(FK)│
│ name        │    │ title       │    │ type        │
│ email       │    │ description │    │ amount      │
│ bio         │    │ category    │    │ status      │
│ location    │    │ status      │    │ created_at  │
│ credits     │    │ priority    │    └─────────────┘
│ created_at  │    │ location    │
└─────────────┘    │ latitude    │    ┌─────────────┐
                   │ longitude   │    │   messages  │
┌─────────────┐    │ skills[]    │    ├─────────────┤
│   wallets   │    │ tags[]      │    │ conversation_id(FK)│
├─────────────┤    │ budget      │    │ sender_id(FK)│
│ id (PK)     │    │ deadline    │    │ content     │
│ user_id (FK)│    │ created_at  │    │ type        │
│ balance     │    └─────────────┘    │ timestamp   │
│ total_earned│                       └─────────────┘
│ total_spent │
└─────────────┘
```

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

### **2. Table `tasks` - Tâches**

**Description :** Stocke les demandes d'aide et offres de service des utilisateurs.

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('local','remote')) DEFAULT 'local',
  status TEXT CHECK (status IN ('open','in_progress','completed','cancelled','on_hold','review')) DEFAULT 'open',
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
  feedback TEXT,
  
  -- Nouvelles colonnes pour le suivi avancé
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_step TEXT,
  total_steps INTEGER DEFAULT 1,
  completed_steps INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- en minutes
  is_overdue BOOLEAN DEFAULT FALSE,
  complexity TEXT CHECK (complexity IN ('simple','moderate','complex')) DEFAULT 'simple',
  dependencies INTEGER[] DEFAULT '{}',
  parent_task_id INTEGER REFERENCES tasks(id)
);
```

### **3. Table `wallets` - Portefeuilles**

**Description :** Gère les portefeuilles numériques des utilisateurs.

```sql
CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_earned DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### **4. Table `transactions` - Transactions**

**Description :** Enregistre toutes les transactions de crédits.

```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'withdrawal', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('task_completion', 'help_offer', 'withdrawal', 'bonus', 'refund', 'credit_purchase')),
  reference_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);
```

### **5. Table `conversations` - Conversations**

**Description :** Gère les conversations entre utilisateurs.

```sql
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participants UUID[] NOT NULL,
  last_message_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE
);
```

### **6. Table `messages` - Messages**

**Description :** Stocke les messages des conversations.

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  reply_to_id UUID REFERENCES messages(id)
);
```

### **7. Table `help_offers` - Offres d'Aide**

**Description :** Gère les offres d'aide pour les tâches.

```sql
CREATE TABLE help_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  helper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  proposed_duration INTEGER,
  proposed_credits DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_message TEXT
);
```

### **8. Table `credit_earnings` - Gains de Crédits**

**Description :** Suit les gains de crédits des utilisateurs.

```sql
CREATE TABLE credit_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  help_offer_id UUID REFERENCES help_offers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  task_title TEXT NOT NULL,
  task_owner TEXT NOT NULL
);
```

### **9. Table `withdrawal_requests` - Demandes de Retrait**

**Description :** Gère les demandes de retrait d'argent.

```sql
CREATE TABLE withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  account_details JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  notes TEXT
);
```

### **10. Table `credit_packages` - Packages de Crédits**

**Description :** Définit les packages de crédits disponibles à l'achat.

```sql
CREATE TABLE credit_packages (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  bonus_credits INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔗 Relations et Contraintes

### **Relations Principales**

1. **users** → **tasks** : Un utilisateur peut créer plusieurs tâches (1:N)
2. **users** → **wallets** : Un utilisateur a un portefeuille (1:1)
3. **wallets** → **transactions** : Un portefeuille peut avoir plusieurs transactions (1:N)
4. **tasks** → **help_offers** : Une tâche peut recevoir plusieurs offres (1:N)
5. **conversations** → **messages** : Une conversation contient plusieurs messages (1:N)
6. **users** → **messages** : Un utilisateur peut envoyer plusieurs messages (1:N)

### **Contraintes de Clés Étrangères**

```sql
-- Tâches
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_assigned 
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Portefeuilles
ALTER TABLE wallets ADD CONSTRAINT fk_wallets_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Transactions
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_wallet 
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE;

-- Messages
ALTER TABLE messages ADD CONSTRAINT fk_messages_conversation 
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

ALTER TABLE messages ADD CONSTRAINT fk_messages_sender 
  FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

## 📊 Index de Performance

### **Index Principaux**

```sql
-- Utilisateurs
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Tâches
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

-- Portefeuilles
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_balance ON wallets(balance);

-- Transactions
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_reference ON transactions(reference_type, reference_id);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Conversations
CREATE INDEX idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

-- Offres d'aide
CREATE INDEX idx_help_offers_task_id ON help_offers(task_id);
CREATE INDEX idx_help_offers_helper_id ON help_offers(helper_id);
CREATE INDEX idx_help_offers_status ON help_offers(status);
```

## 🔐 Politiques de Sécurité (RLS)

### **Activation RLS**

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
```

### **Politiques Utilisateurs**

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

### **Politiques Tâches**

```sql
-- Les utilisateurs peuvent voir toutes les tâches
CREATE POLICY "Users can view all tasks" ON tasks
  FOR SELECT USING (true);

-- Les utilisateurs peuvent créer des tâches
CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres tâches
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres tâches
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

### **Politiques Portefeuille**

```sql
-- Les utilisateurs peuvent voir leur propre portefeuille
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leur portefeuille
CREATE POLICY "Users can create own wallet" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leur propre portefeuille
CREATE POLICY "Users can update own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);
```

### **Politiques Transactions**

```sql
-- Les utilisateurs peuvent voir leurs propres transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer des transactions pour leur portefeuille
CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );
```

### **Politiques Messages**

```sql
-- Les utilisateurs peuvent voir les messages de leurs conversations
CREATE POLICY "Users can view conversation messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE participants @> ARRAY[auth.uid()::text]
    )
  );

-- Les utilisateurs peuvent envoyer des messages dans leurs conversations
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE participants @> ARRAY[auth.uid()::text]
    )
  );
```

## 🔄 Triggers et Fonctions

### **Trigger de Mise à Jour des Timestamps**

```sql
-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Trigger de Mise à Jour du Solde du Portefeuille**

```sql
-- Fonction pour mettre à jour le solde du portefeuille
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'credit' THEN
            UPDATE wallets 
            SET balance = balance + NEW.amount,
                total_earned = total_earned + NEW.amount
            WHERE id = NEW.wallet_id;
        ELSIF NEW.type = 'debit' THEN
            UPDATE wallets 
            SET balance = balance - NEW.amount,
                total_spent = total_spent + NEW.amount
            WHERE id = NEW.wallet_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur les transactions
CREATE TRIGGER trigger_update_wallet_balance
    AFTER INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();
```

## 📈 Optimisations et Maintenance

### **Analyse des Performances**

```sql
-- Analyser les requêtes lentes
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Analyser l'utilisation des index
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;
```

### **Nettoyage et Maintenance**

```sql
-- Nettoyer les anciennes données
DELETE FROM messages 
WHERE created_at < NOW() - INTERVAL '1 year'
AND conversation_id IN (
    SELECT id FROM conversations WHERE is_archived = true
);

-- Mettre à jour les statistiques
ANALYZE;

-- Reconstruire les index
REINDEX DATABASE entraide_universelle;
```

---

Ce schéma de base de données fournit une base solide et scalable pour l'application Entraide Universelle, avec des optimisations de performance et une sécurité robuste via RLS.