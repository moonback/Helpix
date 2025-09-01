-- Script de test pour vérifier que les erreurs de commentaires sont résolues
-- Exécutez ce script après avoir désactivé les commentaires automatiques

-- 1. Vérifier la structure de la table tasks
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND table_schema = 'public'
  AND column_name IN ('comments', 'progress_percentage', 'completed_steps', 'total_steps')
ORDER BY column_name;

-- 2. Test de sélection des tâches
SELECT 
  id,
  title,
  status,
  progress_percentage,
  completed_steps,
  total_steps,
  created_at,
  updated_at
FROM tasks
LIMIT 3;

-- 3. Vérification finale
SELECT 
  'COMMENTAIRES DESACTIVES' as status,
  'Les erreurs PGRST204 devraient être résolues' as message;
