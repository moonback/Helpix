-- 🧪 Script de test pour les tâches existantes avec paiements en attente
-- Ce script teste le système de paiement sur les tâches déjà terminées

-- 1. Vérifier les tâches terminées avec paiements en attente
SELECT 
  'Tâches terminées avec paiements en attente:' as info,
  t.id,
  t.title,
  t.budget_credits,
  t.user_id as creator_id,
  t.assigned_to as helper_id,
  t.status,
  t.completion_date,
  CASE 
    WHEN tr.id IS NULL THEN 'Paiement en attente'
    ELSE 'Paiement traité'
  END as statut_paiement
FROM tasks t
LEFT JOIN transactions tr ON tr.reference_type = 'task_completion' 
  AND tr.reference_id = t.id::text
WHERE t.status = 'completed'
  AND t.budget_credits > 0
  AND t.assigned_to IS NOT NULL
ORDER BY t.completion_date DESC;

-- 2. Vérifier les soldes des utilisateurs concernés
SELECT 
  'Soldes des utilisateurs concernés:' as info,
  w.user_id,
  w.balance,
  w.total_earned,
  w.total_spent,
  w.updated_at
FROM wallets w
WHERE w.user_id IN (
  SELECT DISTINCT user_id FROM tasks 
  WHERE status = 'completed' AND budget_credits > 0 AND assigned_to IS NOT NULL
  UNION
  SELECT DISTINCT assigned_to FROM tasks 
  WHERE status = 'completed' AND budget_credits > 0 AND assigned_to IS NOT NULL
)
ORDER BY w.user_id;

-- 3. Déclencher manuellement le paiement pour une tâche spécifique
-- Remplacez TASK_ID par l'ID d'une tâche avec "Paiement en attente"
/*
UPDATE tasks 
SET 
  status = 'completed',
  completion_date = NOW(),
  progress_percentage = 100,
  updated_at = NOW()
WHERE id = TASK_ID; -- Remplacez par l'ID de la tâche
*/

-- 4. Vérifier les transactions après paiement
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
  AND t.reference_id = 'TASK_ID' -- Remplacez par l'ID de la tâche
ORDER BY t.created_at;
*/

-- 5. Vérifier les soldes après paiement
/*
SELECT 
  w.user_id,
  w.balance,
  w.total_earned,
  w.total_spent,
  w.updated_at
FROM wallets w
WHERE w.user_id IN (
  SELECT user_id FROM tasks WHERE id = TASK_ID
  UNION
  SELECT assigned_to FROM tasks WHERE id = TASK_ID
)
ORDER BY w.user_id;
*/

-- 📊 Requêtes de monitoring

-- Nombre de paiements traités aujourd'hui
SELECT 
  DATE(created_at) as date,
  COUNT(*) as paiements_traites
FROM transactions 
WHERE reference_type = 'task_completion'
  AND DATE(created_at) = CURRENT_DATE
GROUP BY DATE(created_at);

-- Montant total des paiements par jour (7 derniers jours)
SELECT 
  DATE(created_at) as date,
  SUM(amount) as montant_total,
  COUNT(*) as nombre_transactions
FROM transactions 
WHERE reference_type = 'task_completion'
  AND type = 'credit'
  AND DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Tâches avec paiements en attente (détaillé)
SELECT 
  t.id,
  t.title,
  t.budget_credits,
  t.status,
  t.completion_date,
  t.user_id as creator_id,
  t.assigned_to as helper_id,
  CASE 
    WHEN tr.id IS NULL THEN 'Paiement en attente'
    ELSE 'Paiement traité'
  END as statut_paiement
FROM tasks t
LEFT JOIN transactions tr ON tr.reference_type = 'task_completion' 
  AND tr.reference_id = t.id::text
WHERE t.status = 'completed'
  AND t.budget_credits > 0
  AND t.assigned_to IS NOT NULL
ORDER BY t.completion_date DESC;

-- 🔍 Diagnostic des erreurs

-- Transactions échouées
SELECT 
  t.id,
  t.type,
  t.amount,
  t.status,
  t.description,
  t.created_at,
  t.metadata
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.status = 'failed'
ORDER BY t.created_at DESC;

-- Wallets avec solde négatif (erreur possible)
SELECT 
  w.user_id,
  w.balance,
  w.total_earned,
  w.total_spent,
  w.updated_at
FROM wallets w
WHERE w.balance < 0
ORDER BY w.balance ASC;

-- 🧪 Test rapide: Déclencher le paiement pour toutes les tâches en attente
-- ATTENTION: Ceci va traiter TOUTES les tâches en attente de paiement
/*
UPDATE tasks 
SET 
  status = 'completed',
  completion_date = NOW(),
  progress_percentage = 100,
  updated_at = NOW()
WHERE id IN (
  SELECT t.id
  FROM tasks t
  LEFT JOIN transactions tr ON tr.reference_type = 'task_completion' 
    AND tr.reference_id = t.id::text
  WHERE t.status = 'completed'
    AND t.budget_credits > 0
    AND t.assigned_to IS NOT NULL
    AND tr.id IS NULL
);
*/

-- Vérifier le résultat après traitement automatique
/*
SELECT 
  'Résultat après traitement automatique:' as info,
  COUNT(*) as total_taches_traitees,
  SUM(budget_credits) as total_credits_transferes
FROM tasks t
JOIN transactions tr ON tr.reference_type = 'task_completion' 
  AND tr.reference_id = t.id::text
WHERE t.status = 'completed'
  AND t.budget_credits > 0
  AND t.assigned_to IS NOT NULL
  AND tr.type = 'credit';
*/
