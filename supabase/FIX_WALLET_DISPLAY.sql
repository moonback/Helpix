-- Script pour corriger l'affichage des gains dans le wallet
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier les transactions de crédit pour les tâches terminées
-- et s'assurer que les métadonnées contiennent les bonnes informations
SELECT 
  t.id,
  t.wallet_id,
  t.type,
  t.amount,
  t.description,
  t.metadata,
  t.created_at,
  w.user_id as wallet_owner,
  task.user_id as task_owner,
  task.assigned_to as task_helper
FROM transactions t
JOIN wallets w ON t.wallet_id = w.id
LEFT JOIN tasks task ON t.reference_id::INTEGER = task.id
WHERE t.reference_type = 'task_completion'
  AND t.type = 'credit'
ORDER BY t.created_at DESC;

-- 2. Mettre à jour les métadonnées des transactions de crédit
-- pour inclure l'ID du propriétaire de la tâche
UPDATE transactions 
SET metadata = COALESCE(metadata, '{}'::jsonb) || 
    jsonb_build_object(
      'task_owner', task.user_id,
      'task_id', task.id,
      'task_title', task.title
    )
FROM tasks task
WHERE transactions.reference_type = 'task_completion'
  AND transactions.reference_id::INTEGER = task.id
  AND transactions.type = 'credit'
  AND (transactions.metadata->>'task_owner' IS NULL OR transactions.metadata->>'task_owner' = '');

-- 3. Mettre à jour les métadonnées des transactions de débit
-- pour inclure l'ID de l'aideur
UPDATE transactions 
SET metadata = COALESCE(metadata, '{}'::jsonb) || 
    jsonb_build_object(
      'helper_user_id', task.assigned_to,
      'task_id', task.id,
      'task_title', task.title
    )
FROM tasks task
WHERE transactions.reference_type = 'task_completion'
  AND transactions.reference_id::INTEGER = task.id
  AND transactions.type = 'debit'
  AND (transactions.metadata->>'helper_user_id' IS NULL OR transactions.metadata->>'helper_user_id' = '');

-- 4. Vérifier les résultats après mise à jour
SELECT 
  t.id,
  t.type,
  t.amount,
  t.metadata->>'task_owner' as task_owner_id,
  t.metadata->>'helper_user_id' as helper_user_id,
  t.metadata->>'task_title' as task_title,
  w.user_id as wallet_owner,
  CASE 
    WHEN t.type = 'credit' AND t.metadata->>'task_owner' != w.user_id::text THEN 'VRAI GAIN'
    WHEN t.type = 'credit' AND t.metadata->>'task_owner' = w.user_id::text THEN 'PAIEMENT PROPRE TÂCHE'
    WHEN t.type = 'debit' THEN 'DÉBIT PROPRE TÂCHE'
    ELSE 'AUTRE'
  END as transaction_type
FROM transactions t
JOIN wallets w ON t.wallet_id = w.id
WHERE t.reference_type = 'task_completion'
ORDER BY t.created_at DESC;

-- 5. Statistiques par utilisateur
SELECT 
  w.user_id,
  COUNT(CASE WHEN t.type = 'credit' AND t.metadata->>'task_owner' != w.user_id::text THEN 1 END) as vrais_gains,
  COUNT(CASE WHEN t.type = 'credit' AND t.metadata->>'task_owner' = w.user_id::text THEN 1 END) as paiements_propres_taches,
  COUNT(CASE WHEN t.type = 'debit' THEN 1 END) as debits_propres_taches,
  SUM(CASE WHEN t.type = 'credit' AND t.metadata->>'task_owner' != w.user_id::text THEN t.amount ELSE 0 END) as total_vrais_gains,
  SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END) as total_debits
FROM transactions t
JOIN wallets w ON t.wallet_id = w.id
WHERE t.reference_type = 'task_completion'
GROUP BY w.user_id
ORDER BY total_vrais_gains DESC;
