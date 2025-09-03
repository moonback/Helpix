-- Script pour nettoyer les transactions en double
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Identifier les transactions en double pour les tâches terminées
WITH duplicate_transactions AS (
  SELECT 
    reference_id,
    type,
    COUNT(*) as count,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
  FROM transactions 
  WHERE reference_type = 'task_completion'
    AND type IN ('credit', 'debit')
  GROUP BY reference_id, type
  HAVING COUNT(*) > 1
),
-- 2. Identifier les transactions à supprimer (garder la première, supprimer les suivantes)
transactions_to_delete AS (
  SELECT t.id
  FROM transactions t
  INNER JOIN duplicate_transactions dt ON t.reference_id = dt.reference_id AND t.type = dt.type
  WHERE t.created_at > dt.first_created
)
-- 3. Supprimer les transactions en double (garder seulement la première de chaque type)
DELETE FROM transactions 
WHERE id IN (SELECT id FROM transactions_to_delete);

-- 4. Afficher un résumé des transactions restantes
SELECT 
  reference_id as task_id,
  type,
  amount,
  description,
  created_at
FROM transactions 
WHERE reference_type = 'task_completion'
  AND type IN ('credit', 'debit')
ORDER BY reference_id, type, created_at;

-- 5. Vérifier qu'il n'y a plus de doublons
SELECT 
  reference_id,
  type,
  COUNT(*) as count
FROM transactions 
WHERE reference_type = 'task_completion'
  AND type IN ('credit', 'debit')
GROUP BY reference_id, type
HAVING COUNT(*) > 1;
