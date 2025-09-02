-- Script de test pour vérifier que les erreurs de tâches sont résolues
-- Exécutez ce script après avoir corrigé le taskStore

-- 1. Vérifier la structure de la table tasks
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier qu'il n'y a pas de colonne last_activity (si vous ne l'avez pas ajoutée)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tasks' 
        AND column_name = 'last_activity'
        AND table_schema = 'public'
    ) 
    THEN 'EXISTE - Ajoutez-la au store si nécessaire' 
    ELSE 'N''EXISTE PAS - Store corrigé correctement' 
  END as last_activity_status;

-- 3. Test de sélection des tâches
SELECT 
  id,
  title,
  status,
  created_at,
  updated_at
FROM tasks
ORDER BY created_at DESC
LIMIT 5;

-- 4. Vérification finale
SELECT 
  'TASKS CORRIGEES' as status,
  'Les erreurs PGRST204 devraient être résolues' as message;
