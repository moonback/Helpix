# 🔧 Résolution de l'Erreur RLS - Récursion Infinie

## 🚨 **Problème identifié**

**Erreur :** `42P17 - infinite recursion detected in policy for relation "conversation_participants"`

**Cause :** Les politiques RLS créées dans le script initial créent des références circulaires entre les tables, causant une récursion infinie lors des requêtes.

## 🛠️ **Solution : Script de correction**

### **Étape 1 : Exécuter le script de correction**

Exécutez le fichier `docs/FIX_RLS_POLICIES.sql` dans votre base de données Supabase :

1. **Ouvrez l'éditeur SQL** dans votre dashboard Supabase
2. **Copiez-collez** le contenu de `docs/FIX_RLS_POLICIES.sql`
3. **Exécutez** le script

### **Étape 2 : Vérification**

Après exécution, vous devriez voir :
```
status
----------------------------------------
Politiques RLS corrigées avec succès !
```

### **Étape 3 : Test de l'application**

1. **Rechargez** votre application React
2. **Naviguez** vers la page de chat
3. **Cliquez** sur le bouton "Charger" pour tester la connexion

## 🔍 **Ce que fait le script de correction**

### **1. Suppression des politiques problématiques**
- Désactive temporairement RLS sur toutes les tables
- Supprime toutes les politiques existantes qui causent la récursion

### **2. Création de nouvelles politiques sécurisées**
- **Conversations** : Accès basé sur la participation
- **Participants** : Accès basé sur l'appartenance aux conversations
- **Messages** : Accès basé sur la participation aux conversations
- **Pièces jointes** : Accès basé sur les messages autorisés

### **3. Sécurité maintenue**
- ✅ **Authentification** requise pour toutes les opérations
- ✅ **Isolation** des données entre utilisateurs
- ✅ **Contrôle d'accès** granulaire par conversation
- ✅ **Prévention** des fuites de données

## 📋 **Politiques RLS créées**

| **Table** | **Politique** | **Description** |
|-----------|---------------|-----------------|
| `conversations` | `Users can view conversations they participate in` | Voir uniquement les conversations où l'utilisateur est participant |
| `conversations` | `Users can create conversations` | Créer de nouvelles conversations |
| `conversations` | `Users can update conversations they participate in` | Modifier les conversations où l'utilisateur est participant |
| `conversations` | `Users can delete conversations they participate in` | Supprimer les conversations où l'utilisateur est participant |
| `conversation_participants` | `Users can view participants in their conversations` | Voir les participants des conversations autorisées |
| `conversation_participants` | `Users can join conversations` | Rejoindre des conversations |
| `conversation_participants` | `Users can leave conversations` | Quitter ses propres conversations |
| `messages` | `Users can view messages in their conversations` | Voir les messages des conversations autorisées |
| `messages` | `Users can send messages` | Envoyer des messages dans les conversations autorisées |
| `messages` | `Users can update their own messages` | Modifier ses propres messages |
| `messages` | `Users can delete their own messages` | Supprimer ses propres messages |
| `attachments` | `Users can view attachments in their conversations` | Voir les pièces jointes des conversations autorisées |
| `attachments` | `Users can upload attachments` | Télécharger des pièces jointes dans les conversations autorisées |
| `attachments` | `Users can delete their attachments` | Supprimer ses propres pièces jointes |

## 🧪 **Test de fonctionnement**

### **Test 1 : Chargement des conversations**
```typescript
// Dans ConversationList.tsx
const { fetchConversations } = useMessageStore();

// Cliquer sur "Charger" devrait maintenant fonctionner
<Button onClick={fetchConversations}>Charger</Button>
```

### **Test 2 : Création d'une conversation**
```typescript
// Dans le store de messages
const { createConversation } = useMessageStore();

// Créer une nouvelle conversation
await createConversation([userId1, userId2]);
```

### **Test 3 : Envoi de messages**
```typescript
// Dans le store de messages
const { sendMessage } = useMessageStore();

// Envoyer un message
await sendMessage("Bonjour !", receiverId);
```

## 🚨 **En cas de problème persistant**

### **Vérification des politiques**
```sql
-- Vérifier que les politiques sont créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'attachments')
ORDER BY tablename, policyname;
```

### **Vérification des permissions**
```sql
-- Vérifier les permissions sur les tables
SELECT table_name, privilege_type, grantee
FROM information_schema.role_table_grants
WHERE table_name IN ('conversations', 'conversation_participants', 'messages', 'attachments');
```

### **Reset complet si nécessaire**
```sql
-- En dernier recours, désactiver RLS complètement
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE attachments DISABLE ROW LEVEL SECURITY;

-- Puis réactiver progressivement
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- Créer une politique simple d'abord
CREATE POLICY "basic_access" ON conversations FOR ALL USING (true);
```

## ✅ **Résultat attendu**

Après application du script de correction :

1. ✅ **Erreur 500** disparaît
2. ✅ **Requêtes** fonctionnent normalement
3. ✅ **Sécurité** maintenue via RLS
4. ✅ **Système de messagerie** opérationnel
5. ✅ **Performance** optimisée

## 🔄 **Prochaines étapes**

Une fois le problème RLS résolu :

1. **Tester** toutes les fonctionnalités de messagerie
2. **Implémenter** les notifications en temps réel
3. **Ajouter** la gestion des pièces jointes
4. **Optimiser** les performances des requêtes
5. **Déployer** en production

---

**💡 Conseil :** Gardez une copie du script de correction pour les futurs déploiements ou en cas de problème similaire.
