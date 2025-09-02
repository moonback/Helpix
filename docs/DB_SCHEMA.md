# 🗄️ Schéma de Base de Données - Entraide Universelle

## 🎯 Vue d'Ensemble

La base de données d'Entraide Universelle est construite sur **PostgreSQL** via Supabase, avec une architecture optimisée pour la géolocalisation, la messagerie temps réel et la gestion des crédits. Le schéma suit les principes de normalisation tout en maintenant des performances optimales.

## 🏗️ Architecture Générale

### **Principes de Conception**

1. **Normalisation** : Éviter la redondance des données
2. **Performance** : Index optimisés pour les requêtes fréquentes
3. **Sécurité** : Row Level Security (RLS) sur toutes les tables
4. **Scalabilité** : Structure prête pour la croissance
5. **Intégrité** : Contraintes et validations strictes

### **Technologies Utilisées**

- **PostgreSQL 15+** : Base de données principale
- **PostGIS** : Extension pour la géolocalisation
- **Row Level Security** : Sécurité au niveau des lignes
- **Triggers** : Automatisation des processus
- **Functions** : Logique métier côté serveur

## 📊 Schéma des Tables

### **1. Table `users` - Utilisateurs**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'France',
  bio TEXT,
  skills TEXT[], -- Array de compétences
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Index :**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_rating ON users(rating DESC);
CREATE INDEX idx_users_last_activity ON users(last_activity);
```

**RLS Policies :**
```sql
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### **2. Table `tasks` - Tâches d'Entraide**

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget_credits DECIMAL(10,2) NOT NULL CHECK (budget_credits > 0),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'France',
  estimated_duration INTEGER, -- en minutes
  required_skills TEXT[],
  images TEXT[], -- URLs des images
  is_urgent BOOLEAN DEFAULT FALSE,
  is_remote BOOLEAN DEFAULT FALSE,
  max_distance INTEGER DEFAULT 10, -- en km
  deadline TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Index :**
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_city ON tasks(city);
CREATE INDEX idx_tasks_budget ON tasks(budget_credits);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Index géospatial pour les requêtes de proximité
CREATE INDEX idx_tasks_location ON tasks USING GIST (
  ll_to_earth(latitude, longitude)
);
```

**RLS Policies :**
```sql
-- Lecture publique des tâches ouvertes
CREATE POLICY "Public can view open tasks" ON tasks
  FOR SELECT USING (status = 'open');

-- Les utilisateurs peuvent voir leurs propres tâches
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer des tâches
CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres tâches
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);
```

### **3. Table `wallets` - Portefeuilles**

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Index :**
```sql
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_balance ON wallets(balance);
```

**RLS Policies :**
```sql
-- Les utilisateurs peuvent voir leur propre portefeuille
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leur propre portefeuille
CREATE POLICY "Users can update own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);
```

### **4. Table `transactions` - Transactions de Crédits**

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  reference_id UUID, -- ID de la tâche, achat, etc.
  reference_type VARCHAR(50), -- 'task_completion', 'credit_purchase', etc.
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method VARCHAR(50), -- 'stripe', 'paypal', 'bank_transfer'
  payment_id VARCHAR(255), -- ID de la transaction de paiement
  metadata JSONB, -- Données supplémentaires
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Index :**
```sql
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_reference ON transactions(reference_id, reference_type);
```

**RLS Policies :**
```sql
-- Les utilisateurs peuvent voir leurs propres transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );
```

### **5. Table `conversations` - Conversations**

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte pour éviter les doublons
  UNIQUE(task_id, participant1_id, participant2_id)
);
```

**Index :**
```sql
CREATE INDEX idx_conversations_task_id ON conversations(task_id);
CREATE INDEX idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

**RLS Policies :**
```sql
-- Les utilisateurs peuvent voir leurs conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    participant1_id = auth.uid() OR participant2_id = auth.uid()
  );

-- Les utilisateurs peuvent créer des conversations
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    participant1_id = auth.uid() OR participant2_id = auth.uid()
  );
```

### **6. Table `messages` - Messages**

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  reply_to_id UUID REFERENCES messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Index :**
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX idx_messages_is_read ON messages(is_read);
```

**RLS Policies :**
```sql
-- Les utilisateurs peuvent voir les messages de leurs conversations
CREATE POLICY "Users can view conversation messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE participant1_id = auth.uid() OR participant2_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent envoyer des messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE participant1_id = auth.uid() OR participant2_id = auth.uid()
    )
  );
```

### **7. Table `help_offers` - Offres d'Aide**

```sql
CREATE TABLE help_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  proposed_credits DECIMAL(10,2), -- Crédits proposés par le helper
  is_negotiable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un utilisateur ne peut faire qu'une offre par tâche
  UNIQUE(task_id, helper_id)
);
```

**Index :**
```sql
CREATE INDEX idx_help_offers_task_id ON help_offers(task_id);
CREATE INDEX idx_help_offers_helper_id ON help_offers(helper_id);
CREATE INDEX idx_help_offers_status ON help_offers(status);
CREATE INDEX idx_help_offers_created_at ON help_offers(created_at DESC);
```

**RLS Policies :**
```sql
-- Les utilisateurs peuvent voir les offres d'aide
CREATE POLICY "Users can view help offers" ON help_offers
  FOR SELECT USING (
    helper_id = auth.uid() OR
    task_id IN (SELECT id FROM tasks WHERE user_id = auth.uid())
  );

-- Les utilisateurs peuvent créer des offres d'aide
CREATE POLICY "Users can create help offers" ON help_offers
  FOR INSERT WITH CHECK (
    helper_id = auth.uid() AND
    task_id NOT IN (SELECT id FROM tasks WHERE user_id = auth.uid())
  );
```

### **8. Table `ratings` - Notes et Avis**

```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un utilisateur ne peut noter qu'une fois par tâche
  UNIQUE(task_id, rater_id)
);
```

**Index :**
```sql
CREATE INDEX idx_ratings_task_id ON ratings(task_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX idx_ratings_rated_id ON ratings(rated_id);
CREATE INDEX idx_ratings_rating ON ratings(rating);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);
```

**RLS Policies :**
```sql
-- Les utilisateurs peuvent voir les notes publiques
CREATE POLICY "Users can view public ratings" ON ratings
  FOR SELECT USING (is_public = TRUE);

-- Les utilisateurs peuvent créer des notes
CREATE POLICY "Users can create ratings" ON ratings
  FOR INSERT WITH CHECK (
    rater_id = auth.uid() AND
    task_id IN (
      SELECT id FROM tasks 
      WHERE user_id = auth.uid() OR assigned_to = auth.uid()
    )
  );
```

### **9. Table `notifications` - Notifications**

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Données supplémentaires
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT, -- URL pour l'action
  action_text VARCHAR(100), -- Texte du bouton d'action
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Index :**
```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);
```

**RLS Policies :**
```sql
-- Les utilisateurs peuvent voir leurs notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Les utilisateurs peuvent marquer leurs notifications comme lues
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
```

### **10. Table `credit_earnings` - Gains de Crédits**

```sql
CREATE TABLE credit_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  earning_type VARCHAR(50) NOT NULL, -- 'task_completion', 'referral', 'bonus'
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Index :**
```sql
CREATE INDEX idx_credit_earnings_user_id ON credit_earnings(user_id);
CREATE INDEX idx_credit_earnings_task_id ON credit_earnings(task_id);
CREATE INDEX idx_credit_earnings_status ON credit_earnings(status);
CREATE INDEX idx_credit_earnings_created_at ON credit_earnings(created_at DESC);
```

## 🔧 Fonctions et Triggers

### **1. Fonction de Mise à Jour du Solde du Portefeuille**

```sql
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le solde du portefeuille
  UPDATE wallets 
  SET 
    balance = balance + NEW.amount,
    total_earned = total_earned + CASE WHEN NEW.type = 'credit' THEN NEW.amount ELSE 0 END,
    total_spent = total_spent + CASE WHEN NEW.type = 'debit' THEN NEW.amount ELSE 0 END,
    updated_at = NOW()
  WHERE id = NEW.wallet_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les nouvelles transactions
CREATE TRIGGER trigger_update_wallet_balance
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();
```

### **2. Fonction de Création Automatique de Portefeuille**

```sql
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer un portefeuille pour le nouvel utilisateur
  INSERT INTO wallets (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 10.00, 10.00, 0.00); -- 10 crédits de bienvenue
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les nouveaux utilisateurs
CREATE TRIGGER trigger_create_user_wallet
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();
```

### **3. Fonction de Calcul de Distance**

```sql
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lng1 DECIMAL,
  lat2 DECIMAL,
  lng2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * 
      cos(radians(lng2) - radians(lng1)) + 
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql;
```

### **4. Fonction de Mise à Jour de la Note Utilisateur**

```sql
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculer la note moyenne de l'utilisateur
  UPDATE users 
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM ratings 
      WHERE rated_id = NEW.rated_id AND is_public = TRUE
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM ratings 
      WHERE rated_id = NEW.rated_id AND is_public = TRUE
    ),
    updated_at = NOW()
  WHERE id = NEW.rated_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les nouvelles notes
CREATE TRIGGER trigger_update_user_rating
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();
```

## 📊 Vues Utiles

### **1. Vue des Tâches avec Informations Utilisateur**

```sql
CREATE VIEW tasks_with_user_info AS
SELECT 
  t.*,
  u.first_name,
  u.last_name,
  u.avatar_url,
  u.rating as user_rating,
  u.total_ratings as user_total_ratings
FROM tasks t
JOIN users u ON t.user_id = u.id;
```

### **2. Vue des Conversations avec Dernier Message**

```sql
CREATE VIEW conversations_with_last_message AS
SELECT 
  c.*,
  t.title as task_title,
  t.status as task_status,
  u1.first_name as participant1_name,
  u1.avatar_url as participant1_avatar,
  u2.first_name as participant2_name,
  u2.avatar_url as participant2_avatar,
  m.content as last_message_content,
  m.created_at as last_message_at,
  m.sender_id as last_message_sender_id
FROM conversations c
JOIN tasks t ON c.task_id = t.id
JOIN users u1 ON c.participant1_id = u1.id
JOIN users u2 ON c.participant2_id = u2.id
LEFT JOIN LATERAL (
  SELECT content, created_at, sender_id
  FROM messages
  WHERE conversation_id = c.id
  ORDER BY created_at DESC
  LIMIT 1
) m ON true;
```

### **3. Vue des Statistiques Utilisateur**

```sql
CREATE VIEW user_stats AS
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.rating,
  u.total_ratings,
  w.balance,
  w.total_earned,
  w.total_spent,
  COUNT(DISTINCT t.id) as total_tasks_created,
  COUNT(DISTINCT t2.id) as total_tasks_completed,
  COUNT(DISTINCT ho.id) as total_help_offers,
  COUNT(DISTINCT c.id) as total_conversations
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN tasks t ON u.id = t.user_id
LEFT JOIN tasks t2 ON u.id = t2.assigned_to AND t2.status = 'completed'
LEFT JOIN help_offers ho ON u.id = ho.helper_id
LEFT JOIN conversations c ON u.id = c.participant1_id OR u.id = c.participant2_id
GROUP BY u.id, u.first_name, u.last_name, u.rating, u.total_ratings, w.balance, w.total_earned, w.total_spent;
```

## 🔍 Requêtes d'Exemple

### **1. Recherche de Tâches par Proximité**

```sql
-- Tâches dans un rayon de 10km
SELECT 
  t.*,
  calculate_distance(48.8566, 2.3522, t.latitude, t.longitude) as distance_km
FROM tasks t
WHERE 
  t.status = 'open' AND
  calculate_distance(48.8566, 2.3522, t.latitude, t.longitude) <= 10
ORDER BY distance_km ASC
LIMIT 20;
```

### **2. Statistiques des Tâches par Catégorie**

```sql
SELECT 
  category,
  COUNT(*) as total_tasks,
  AVG(budget_credits) as avg_budget,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tasks
FROM tasks
GROUP BY category
ORDER BY total_tasks DESC;
```

### **3. Top Utilisateurs par Gains**

```sql
SELECT 
  u.first_name,
  u.last_name,
  u.rating,
  w.total_earned,
  COUNT(DISTINCT t.id) as tasks_completed
FROM users u
JOIN wallets w ON u.id = w.user_id
JOIN tasks t ON u.id = t.assigned_to AND t.status = 'completed'
GROUP BY u.id, u.first_name, u.last_name, u.rating, w.total_earned
ORDER BY w.total_earned DESC
LIMIT 10;
```

## 🚀 Optimisations et Performance

### **Index Recommandés**

```sql
-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_tasks_status_category ON tasks(status, category);
CREATE INDEX idx_tasks_location_status ON tasks USING GIST (ll_to_earth(latitude, longitude), status);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_transactions_wallet_created ON transactions(wallet_id, created_at DESC);
```

### **Partitioning (pour la Scalabilité)**

```sql
-- Partitioning par date pour les messages (exemple)
CREATE TABLE messages_2024 PARTITION OF messages
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE messages_2025 PARTITION OF messages
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### **Maintenance et Monitoring**

```sql
-- Statistiques des tables
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Taille des tables
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔒 Sécurité et Conformité

### **Audit Trail**

```sql
-- Table d'audit pour les modifications sensibles
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Chiffrement des Données Sensibles**

```sql
-- Extension pour le chiffrement
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fonction de chiffrement pour les données sensibles
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(encrypt(data::bytea, 'encryption_key', 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;
```

---

Ce schéma de base de données est conçu pour être performant, sécurisé et évolutif, supportant les besoins actuels et futurs d'Entraide Universelle tout en maintenant l'intégrité des données et la conformité aux réglementations.
