-- 🧪 Script de test automatique pour le système de paiement
-- Ce script utilise des utilisateurs existants pour les tests

-- 1. Sélectionner des utilisateurs existants pour les tests
WITH test_users AS (
  SELECT 
    u1.id as creator_id,
    u2.id as helper_id
  FROM auth.users u1
  CROSS JOIN auth.users u2
  WHERE u1.id != u2.id
  LIMIT 1
),
-- 2. Créer ou mettre à jour des wallets de test pour les utilisateurs
test_wallets AS (
  INSERT INTO wallets (user_id, balance, total_earned, total_spent, created_at, updated_at)
  SELECT 
    creator_id,
    100, -- 100 crédits pour le créateur
    0,
    0,
    NOW(),
    NOW()
  FROM test_users
  WHERE NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = creator_id)
  UNION ALL
  SELECT 
    helper_id,
    50, -- 50 crédits pour l'aideur
    0,
    0,
    NOW(),
    NOW()
  FROM test_users
  WHERE NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = helper_id)
  RETURNING user_id, id as wallet_id
),
-- 3. Créer une tâche de test
test_task AS (
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
  )
  SELECT 
    tu.creator_id,
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
  FROM test_users tu
  RETURNING id as task_id, user_id as creator_id, budget_credits
)
-- 4. Afficher les informations de test
SELECT 
  'Test créé avec succès' as status,
  tt.task_id,
  tt.creator_id,
  tu.helper_id,
  tt.budget_credits,
  'Prochaines étapes:' as instructions,
  '1. Assigner la tâche: UPDATE tasks SET assigned_to = ''' || tu.helper_id || ''', status = ''in_progress'' WHERE id = ' || tt.task_id || ';' as step1,
  '2. Terminer la tâche: UPDATE tasks SET status = ''completed'', completion_date = NOW() WHERE id = ' || tt.task_id || ';' as step2,
  '3. Vérifier les transactions: SELECT * FROM transactions WHERE reference_id = ''' || tt.task_id || ''';' as step3
FROM test_task tt
CROSS JOIN test_users tu;

-- 📋 Instructions pour continuer le test:

-- ÉTAPE 1: Assigner la tâche à l'aideur
-- (Remplacez TASK_ID et HELPER_ID par les valeurs affichées ci-dessus)
/*
UPDATE tasks 
SET 
  assigned_to = 'HELPER_ID_ICI',
  status = 'in_progress',
  updated_at = NOW()
WHERE id = TASK_ID_ICI;
*/

-- ÉTAPE 2: Marquer la tâche comme terminée (déclenche le paiement automatique)
/*
UPDATE tasks 
SET 
  status = 'completed',
  completion_date = NOW(),
  progress_percentage = 100,
  updated_at = NOW()
WHERE id = TASK_ID_ICI;
*/

-- ÉTAPE 3: Vérifier les transactions créées
/*
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
  AND t.reference_id = 'TASK_ID_ICI'
ORDER BY t.created_at;
*/

-- ÉTAPE 4: Vérifier les soldes des wallets
/*
SELECT 
  w.user_id,
  w.balance,
  w.total_earned,
  w.total_spent,
  w.updated_at
FROM wallets w
WHERE w.user_id IN ('CREATOR_ID_ICI', 'HELPER_ID_ICI')
ORDER BY w.user_id;
*/

-- ÉTAPE 5: Vérifier que le paiement a été traité
/*
SELECT 
  CASE 
    WHEN COUNT(*) = 2 THEN 'Paiement traité correctement'
    ELSE 'Paiement incomplet ou non traité'
  END as status_paiement,
  COUNT(*) as nombre_transactions
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.reference_id = 'TASK_ID_ICI'
  AND t.type IN ('credit', 'debit');
*/

-- 🧹 Nettoyage (optionnel)
/*
-- Supprimer les transactions de test
DELETE FROM transactions 
WHERE reference_type = 'task_completion' 
  AND reference_id = 'TASK_ID_ICI';

-- Supprimer la tâche de test
DELETE FROM tasks WHERE id = TASK_ID_ICI;

-- Supprimer les wallets de test
DELETE FROM wallets 
WHERE user_id IN ('CREATOR_ID_ICI', 'HELPER_ID_ICI');
*/
