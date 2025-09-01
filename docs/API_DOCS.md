# 📚 Documentation API - Entraide Universelle

## 🎯 Vue d'Ensemble

Entraide Universelle utilise **Supabase** comme backend-as-a-service, fournissant une API REST automatique basée sur le schéma PostgreSQL.

## 🔗 Base URL

```
Production: https://your-project.supabase.co/rest/v1/
Development: http://localhost:54321/rest/v1/
```

## 🔐 Authentification

### **Headers Requis**

```http
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

## 📋 Endpoints Principaux

### **👤 Utilisateurs**

#### **GET /users**
```http
GET /rest/v1/users?select=id,name,email,avatar_url,bio,location,credits,created_at
```

#### **PATCH /users/{id}**
```http
PATCH /rest/v1/users?id=eq.uuid
Content-Type: application/json

{
  "name": "John Doe Updated",
  "bio": "Nouvelle bio"
}
```

### **📋 Tâches**

#### **GET /tasks**
```http
GET /rest/v1/tasks?select=*&status=eq.open&category=eq.local&order=created_at.desc
```

#### **POST /tasks**
```http
POST /rest/v1/tasks
Content-Type: application/json

{
  "title": "Aide pour déménagement",
  "description": "Besoin d'aide pour déménager",
  "category": "local",
  "priority": "medium",
  "estimated_duration": 4,
  "location": "Paris, France",
  "budget_credits": 100
}
```

### **💰 Portefeuille**

#### **GET /wallets**
```http
GET /rest/v1/wallets?select=*&user_id=eq.uuid
```

#### **GET /transactions**
```http
GET /rest/v1/transactions?select=*&wallet_id=eq.wallet-uuid&order=created_at.desc
```

### **💬 Messagerie**

#### **GET /conversations**
```http
GET /rest/v1/conversations?select=*&participants=cs.{user-uuid}
```

#### **POST /messages**
```http
POST /rest/v1/messages
Content-Type: application/json

{
  "conversation_id": "conversation-uuid",
  "sender_id": "user-uuid",
  "content": "Bonjour, je peux vous aider !",
  "type": "text"
}
```

## 🔄 Real-time Subscriptions

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
    }
  )
  .subscribe();
```

## 🔐 Politiques de Sécurité (RLS)

### **Utilisateurs**
```sql
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### **Tâches**
```sql
CREATE POLICY "Users can view all tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 📊 Fonctions de Base de Données

### **credit_user_for_task_completion**
```sql
CREATE OR REPLACE FUNCTION credit_user_for_task_completion(
  p_user_id UUID,
  p_task_id INTEGER,
  p_amount DECIMAL,
  p_task_title TEXT,
  p_task_owner_id UUID
)
RETURNS BOOLEAN AS $$
-- Fonction pour créditer un utilisateur
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🚨 Gestion d'Erreurs

### **Codes d'Erreur HTTP**
- **200** - Succès
- **400** - Requête invalide
- **401** - Non authentifié
- **403** - Non autorisé (RLS)
- **404** - Ressource non trouvée
- **500** - Erreur serveur

### **Format des Erreurs**
```json
{
  "code": "23505",
  "details": "Key (email)=(user@example.com) already exists.",
  "message": "duplicate key value violates unique constraint"
}
```

## 📈 Performance & Optimisation

### **Index Recommandés**
```sql
CREATE INDEX idx_tasks_location ON tasks USING GIST (
  ll_to_earth(latitude, longitude)
);

CREATE INDEX idx_tasks_status_category ON tasks(status, category);
```

## 🧪 Testing de l'API

```typescript
describe('Tasks API', () => {
  test('should create a task', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData);
      
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```