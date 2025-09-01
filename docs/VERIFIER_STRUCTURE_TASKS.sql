-- Script pour vérifier la structure de la table tasks
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de la table tasks
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes de la table tasks
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'tasks' 
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, kcu.column_name;

-- 3. Vérifier si la colonne last_activity existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tasks' 
        AND column_name = 'last_activity'
        AND table_schema = 'public'
    ) 
    THEN 'EXISTE' 
    ELSE 'N''EXISTE PAS' 
  END as last_activity_status;
