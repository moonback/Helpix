-- Script pour corriger les contraintes de statut
-- Exécutez ce script si vous avez des erreurs de contrainte de statut

-- 1. Vérifier les contraintes existantes
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%status%'
  AND constraint_name LIKE '%tasks%';

-- 2. Supprimer l'ancienne contrainte si elle existe
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- 3. Ajouter une nouvelle contrainte de statut plus flexible
ALTER TABLE tasks 
ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('open', 'pending', 'in_progress', 'completed', 'cancelled', 'on_hold'));

-- 4. Vérifier les statuts actuels dans la table
SELECT 
  status,
  COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- 5. Corriger les statuts invalides si nécessaire
-- (Décommentez les lignes suivantes si vous avez des statuts invalides)
-- UPDATE tasks SET status = 'pending' WHERE status NOT IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold');

-- 6. Test de la contrainte
SELECT 
  'CONTRAINTE CORRIGEE' as status,
  'Les statuts sont maintenant valides' as message;
