-- 🔄 Script pour traiter automatiquement les paiements en attente
-- Ce script déclenche le système de paiement pour toutes les tâches terminées non payées

-- 1. Identifier les tâches avec paiements en attente
SELECT 
  'Tâches avec paiements en attente:' as info,
  t.id,
  t.title,
  t.budget_credits,
  t.user_id as creator_id,
  t.assigned_to as helper_id,
  t.completion_date
FROM tasks t
LEFT JOIN transactions tr ON tr.reference_type = 'task_completion' 
  AND tr.reference_id = t.id::text
WHERE t.status = 'completed'
  AND t.budget_credits > 0
  AND t.assigned_to IS NOT NULL
  AND tr.id IS NULL
ORDER BY t.completion_date DESC;

-- 2. Vérifier les soldes avant traitement
SELECT 
  'Soldes avant traitement:' as info,
  w.user_id,
  w.balance,
  w.total_earned,
  w.total_spent
FROM wallets w
WHERE w.user_id IN (
  SELECT DISTINCT user_id FROM tasks 
  WHERE status = 'completed' AND budget_credits > 0 AND assigned_to IS NOT NULL
  AND id NOT IN (
    SELECT DISTINCT reference_id::integer FROM transactions 
    WHERE reference_type = 'task_completion'
  )
  UNION
  SELECT DISTINCT assigned_to FROM tasks 
  WHERE status = 'completed' AND budget_credits > 0 AND assigned_to IS NOT NULL
  AND id NOT IN (
    SELECT DISTINCT reference_id::integer FROM transactions 
    WHERE reference_type = 'task_completion'
  )
)
ORDER BY w.user_id;

-- 3. Traiter les paiements en attente
-- Cette requête va déclencher le système de paiement automatique
UPDATE tasks 
SET 
  status = 'completed',
  completion_date = COALESCE(completion_date, NOW()),
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

-- 4. Vérifier les transactions créées
SELECT 
  'Transactions créées:' as info,
  t.id,
  t.type,
  t.amount,
  t.description,
  t.status,
  t.created_at,
  t.metadata->>'task_title' as task_title
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.created_at >= NOW() - INTERVAL '1 minute'
ORDER BY t.created_at DESC;

-- 5. Vérifier les soldes après traitement
SELECT 
  'Soldes après traitement:' as info,
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

-- 6. Résumé du traitement
SELECT 
  'Résumé du traitement:' as info,
  COUNT(*) as total_taches_traitees,
  SUM(budget_credits) as total_credits_transferes,
  COUNT(DISTINCT user_id) as createurs_concernes,
  COUNT(DISTINCT assigned_to) as aideurs_concernes
FROM tasks t
JOIN transactions tr ON tr.reference_type = 'task_completion' 
  AND tr.reference_id = t.id::text
WHERE t.status = 'completed'
  AND t.budget_credits > 0
  AND t.assigned_to IS NOT NULL
  AND tr.type = 'credit'
  AND tr.created_at >= NOW() - INTERVAL '1 minute';

-- 7. Vérifier qu'il ne reste plus de paiements en attente
SELECT 
  'Paiements restants en attente:' as info,
  COUNT(*) as nombre_taches_en_attente
FROM tasks t
LEFT JOIN transactions tr ON tr.reference_type = 'task_completion' 
  AND tr.reference_id = t.id::text
WHERE t.status = 'completed'
  AND t.budget_credits > 0
  AND t.assigned_to IS NOT NULL
  AND tr.id IS NULL;

-- 📊 Statistiques finales

-- Montant total des paiements traités aujourd'hui
SELECT 
  'Paiements traites aujourd''hui:' as info,
  DATE(created_at) as date,
  COUNT(*) as nombre_paiements,
  SUM(amount) as montant_total
FROM transactions 
WHERE reference_type = 'task_completion'
  AND DATE(created_at) = CURRENT_DATE
GROUP BY DATE(created_at);

-- Top des utilisateurs qui ont reçu le plus de paiements
SELECT 
  'Top des bénéficiaires:' as info,
  t.metadata->>'task_owner' as createur_id,
  COUNT(*) as nombre_paiements_recus,
  SUM(t.amount) as montant_total_recu
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.type = 'credit'
  AND t.created_at >= CURRENT_DATE - INTERVAL '1 day'
GROUP BY t.metadata->>'task_owner'
ORDER BY montant_total_recu DESC
LIMIT 5;
