-- Script de diagnostic complet pour la table tasks
-- Exécutez ce script pour identifier tous les problèmes

-- 1. Structure complète de la table tasks
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Contraintes de la table tasks
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'tasks' 
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, kcu.column_name;

-- 3. Vérifier les colonnes manquantes
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed_steps' AND table_schema = 'public') 
    THEN 'EXISTE' 
    ELSE 'MANQUANTE' 
  END as completed_steps_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'progress_percentage' AND table_schema = 'public') 
    THEN 'EXISTE' 
    ELSE 'MANQUANTE' 
  END as progress_percentage_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'total_steps' AND table_schema = 'public') 
    THEN 'EXISTE' 
    ELSE 'MANQUANTE' 
  END as total_steps_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'current_step' AND table_schema = 'public') 
    THEN 'EXISTE' 
    ELSE 'MANQUANTE' 
  END as current_step_status;

-- 4. Vérifier les valeurs de statut autorisées
SELECT DISTINCT status FROM tasks;

-- 5. Test de sélection basique
SELECT 
  id,
  title,
  status,
  created_at,
  updated_at
FROM tasks
LIMIT 3;
