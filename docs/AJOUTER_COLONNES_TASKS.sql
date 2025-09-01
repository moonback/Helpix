-- Script pour ajouter les colonnes manquantes à la table tasks
-- Exécutez ce script pour corriger les erreurs PGRST204

-- 1. Ajouter les colonnes manquantes
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS completed_steps INTEGER DEFAULT 0 CHECK (completed_steps >= 0);

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS total_steps INTEGER DEFAULT 1 CHECK (total_steps > 0);

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS current_step TEXT;

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0 CHECK (time_spent >= 0);

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT FALSE;

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS complexity TEXT DEFAULT 'simple' CHECK (complexity IN ('simple', 'moderate', 'complex'));

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assigned_to TEXT;

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- 2. Mettre à jour les enregistrements existants
UPDATE tasks 
SET 
  progress_percentage = CASE 
    WHEN status = 'completed' THEN 100
    WHEN status = 'in_progress' THEN 50
    ELSE 0
  END,
  completed_steps = CASE 
    WHEN status = 'completed' THEN total_steps
    WHEN status = 'in_progress' THEN FLOOR(total_steps * 0.5)
    ELSE 0
  END,
  total_steps = COALESCE(total_steps, 1),
  is_overdue = FALSE
WHERE progress_percentage IS NULL OR completed_steps IS NULL;

-- 3. Vérifier que les colonnes ont été ajoutées
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND table_schema = 'public'
  AND column_name IN ('progress_percentage', 'completed_steps', 'total_steps', 'current_step', 'time_spent', 'is_overdue', 'complexity', 'assigned_to', 'completion_date', 'feedback')
ORDER BY column_name;

-- 4. Test de la structure corrigée
SELECT 
  'COLONNES AJOUTEES' as status,
  'La table tasks est maintenant compatible avec le store' as message;
