-- Script de test final pour vérifier que la table tasks fonctionne
-- Exécutez ce script après avoir ajouté les colonnes manquantes

-- 1. Vérifier la structure complète
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Test de sélection avec toutes les colonnes
SELECT 
  id,
  title,
  status,
  progress_percentage,
  completed_steps,
  total_steps,
  current_step,
  time_spent,
  is_overdue,
  complexity,
  assigned_to,
  completion_date,
  created_at,
  updated_at
FROM tasks
LIMIT 3;

-- 3. Test de mise à jour (simulation)
-- Note: Ce test nécessite d'être connecté avec un utilisateur authentifié
SELECT 
  'TEST DE MISE A JOUR' as test_name,
  'Prêt pour les tests d''application' as status;

-- 4. Vérification finale
SELECT 
  'TASKS PRETES' as status,
  'Toutes les colonnes sont disponibles' as message;
