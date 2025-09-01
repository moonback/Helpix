# 🧪 Guide de Test du Système de Paiement

## 📋 Vue d'ensemble

Ce guide vous explique comment tester le système de paiement automatique de votre application d'entraide.

## 🚀 Méthodes de test

### Méthode 1: Test avec tâches existantes (Recommandée)

Vous avez déjà des tâches terminées avec des paiements en attente ! C'est parfait pour tester le système.

1. **Exécutez le script de traitement automatique** :
   ```sql
   -- Utilisez le fichier TRAITER_PAIEMENTS_ATTENTE.sql
   -- Il va traiter automatiquement toutes les tâches en attente de paiement
   ```

2. **Ou testez manuellement une tâche spécifique** :
   ```sql
   -- Utilisez le fichier TEST_PAIEMENT_EXISTANT.sql
   -- Sélectionnez une tâche avec "Paiement en attente" et testez-la
   ```

### Méthode 2: Test avec utilisateurs existants

1. **Exécutez le script simple** :
   ```sql
   -- Exécutez d'abord cette requête pour voir les utilisateurs disponibles
   SELECT id, email FROM auth.users LIMIT 5;
   ```

2. **Créez une tâche de test** :
   ```sql
   INSERT INTO tasks (
     user_id,
     title,
     description,
     category,
     status,
     priority,
     estimated_duration,
     budget_credits,
     required_skills,
     tags,
     location,
     latitude,
     longitude,
     created_at
   ) VALUES (
     'VOTRE_UUID_UTILISATEUR_1', -- Remplacez par un vrai UUID
     'Test de paiement automatique',
     'Cette tâche sert à tester le système de paiement automatique',
     'local',
     'open',
     'medium',
     2,
     25, -- 25 crédits
     ARRAY['test', 'paiement'],
     ARRAY['test', 'automatique'],
     'Paris, France',
     48.8566,
     2.3522,
     NOW()
   );
   ```

3. **Assignez la tâche** :
   ```sql
   UPDATE tasks 
   SET 
     assigned_to = 'VOTRE_UUID_UTILISATEUR_2', -- Un autre utilisateur
     status = 'in_progress',
     updated_at = NOW()
   WHERE id = ID_DE_LA_TACHE; -- L'ID retourné par l'INSERT
   ```

4. **Terminez la tâche** (déclenche le paiement automatique) :
   ```sql
   UPDATE tasks 
   SET 
     status = 'completed',
     completion_date = NOW(),
     progress_percentage = 100,
     updated_at = NOW()
   WHERE id = ID_DE_LA_TACHE;
   ```

### Méthode 3: Test automatique avec utilisateurs existants

1. **Exécutez le script automatique** :
   ```sql
   -- Utilisez le fichier TEST_SYSTEME_PAIEMENT_AUTO.sql (corrigé)
   -- Il utilise des utilisateurs existants et crée les données de test
   ```

## 🔍 Vérifications

### 1. Vérifier les transactions créées
```sql
SELECT 
  t.id,
  t.type,
  t.amount,
  t.description,
  t.status,
  t.created_at,
  t.metadata
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.reference_id = 'ID_DE_LA_TACHE'
ORDER BY t.created_at;
```

**Résultat attendu** : 2 transactions
- 1 transaction de type `debit` (créateur débité)
- 1 transaction de type `credit` (aideur crédité)

### 2. Vérifier les soldes des wallets
```sql
SELECT 
  w.user_id,
  w.balance,
  w.total_earned,
  w.total_spent,
  w.updated_at
FROM wallets w
WHERE w.user_id IN ('UUID_CREATEUR', 'UUID_AIDEUR')
ORDER BY w.user_id;
```

**Résultat attendu** :
- Créateur : `balance` diminué de 25, `total_spent` augmenté de 25
- Aideur : `balance` augmenté de 25, `total_earned` augmenté de 25

### 3. Vérifier le statut du paiement
```sql
SELECT 
  CASE 
    WHEN COUNT(*) = 2 THEN 'Paiement traité correctement'
    ELSE 'Paiement incomplet ou non traité'
  END as status_paiement,
  COUNT(*) as nombre_transactions
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.reference_id = 'ID_DE_LA_TACHE'
  AND t.type IN ('credit', 'debit');
```

## 🚨 Cas d'erreur à tester

### 1. Solde insuffisant
- Créez une tâche avec un budget supérieur au solde du créateur
- Le paiement doit échouer avec un message d'erreur

### 2. Tâche sans aideur assigné
- Marquez une tâche comme terminée sans `assigned_to`
- Aucun paiement ne doit être déclenché

### 3. Paiement en double
- Essayez de marquer la même tâche comme terminée deux fois
- Le deuxième paiement doit être ignoré

## 📊 Monitoring en temps réel

### Requêtes de surveillance
```sql
-- Paiements d'aujourd'hui
SELECT 
  DATE(created_at) as date,
  COUNT(*) as paiements_traites
FROM transactions 
WHERE reference_type = 'task_completion'
  AND DATE(created_at) = CURRENT_DATE
GROUP BY DATE(created_at);

-- Tâches en attente de paiement
SELECT 
  t.id,
  t.title,
  t.budget_credits,
  t.status,
  t.completion_date
FROM tasks t
LEFT JOIN transactions tr ON tr.reference_type = 'task_completion' 
  AND tr.reference_id = t.id::text
WHERE t.status = 'completed'
  AND t.budget_credits > 0
  AND t.assigned_to IS NOT NULL
  AND tr.id IS NULL
ORDER BY t.completion_date DESC;
```

## 🧹 Nettoyage après test

### Supprimer les données de test
```sql
-- Supprimer les transactions de test
DELETE FROM transactions 
WHERE reference_type = 'task_completion' 
  AND reference_id = 'ID_DE_LA_TACHE';

-- Supprimer la tâche de test
DELETE FROM tasks WHERE id = ID_DE_LA_TACHE;

-- Remettre les soldes à zéro si nécessaire
UPDATE wallets 
SET balance = 0, total_earned = 0, total_spent = 0
WHERE user_id IN ('UUID_CREATEUR', 'UUID_AIDEUR');
```

## 🎯 Résultats attendus

### ✅ Test réussi
- 2 transactions créées (débit + crédit)
- Soldes mis à jour correctement
- Notifications affichées dans l'interface
- Aucune erreur dans les logs

### ❌ Test échoué
- Vérifiez les logs d'erreur
- Vérifiez que les utilisateurs ont des wallets
- Vérifiez que les soldes sont suffisants
- Vérifiez la structure de la base de données

## 🔧 Dépannage

### Erreur: "Wallet non trouvé"
- Vérifiez que l'utilisateur a un wallet
- Créez un wallet si nécessaire

### Erreur: "Solde insuffisant"
- Vérifiez le solde du créateur
- Ajoutez des crédits si nécessaire

### Erreur: "Paiement déjà traité"
- Normal, le système évite les doublons
- Vérifiez les transactions existantes

## 📝 Logs à surveiller

Dans la console de l'application, vous devriez voir :
- `✅ Paiement traité avec succès`
- `❌ Solde insuffisant`
- `⚠️ Wallet non trouvé`
- `ℹ️ Le paiement a déjà été traité`

---

**Ce guide vous permet de tester complètement le système de paiement automatique et de vérifier son bon fonctionnement.**
