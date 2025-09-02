-- Script de diagnostic spécifique pour les statuts 'open'
-- Exécutez ce script pour comprendre votre situation actuelle

-- 1. Vérifier tous les statuts existants
SELECT 
  status,
  COUNT(*) as count,
  'Statut actuel' as type
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- 2. Vérifier les contraintes existantes
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%status%'
  AND constraint_name LIKE '%tasks%';

-- 3. Vérifier si la contrainte accepte 'open'
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.check_constraints 
      WHERE constraint_name LIKE '%tasks%status%'
        AND check_clause LIKE '%open%'
    ) 
    THEN 'ACCEPTE OPEN' 
    ELSE 'N''ACCEPTE PAS OPEN' 
  END as open_status_check;

-- 4. Recommandations
SELECT 
  'RECOMMANDATIONS' as type,
  'Gardez le statut "open" ou mappez-le vers "pending"' as suggestion;
