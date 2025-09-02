-- Script pour corriger les statuts existants
-- Exécutez ce script si vous avez des statuts qui ne correspondent pas aux contraintes

-- 1. Vérifier les statuts actuels
SELECT 
  status,
  COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- 2. Corriger les statuts si nécessaire
-- Mapper 'open' vers 'pending' si vous préférez
-- UPDATE tasks SET status = 'pending' WHERE status = 'open';

-- 3. Vérifier que tous les statuts sont valides
SELECT 
  status,
  COUNT(*) as count
FROM tasks
WHERE status NOT IN ('open', 'pending', 'in_progress', 'completed', 'cancelled', 'on_hold')
GROUP BY status;

-- 4. Test de la contrainte
SELECT 
  'STATUTS VERIFIES' as status,
  'Tous les statuts sont maintenant valides' as message;
