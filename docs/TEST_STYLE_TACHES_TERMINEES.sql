-- Script de test pour vérifier le style des tâches terminées
-- Exécutez ce script pour tester l'affichage des tâches terminées

-- 1. Vérifier les tâches terminées
SELECT 
  id,
  title,
  status,
  progress_percentage,
  created_at,
  updated_at
FROM tasks
WHERE status = 'completed'
ORDER BY updated_at DESC
LIMIT 5;

-- 2. Compter les tâches par statut
SELECT 
  status,
  COUNT(*) as nombre_taches
FROM tasks
GROUP BY status
ORDER BY nombre_taches DESC;

-- 3. Vérifier les tâches avec progression 100%
SELECT 
  id,
  title,
  status,
  progress_percentage,
  CASE 
    WHEN progress_percentage = 100 THEN 'PROGRESSION COMPLETE'
    ELSE 'PROGRESSION PARTIELLE'
  END as progression_status
FROM tasks
WHERE status = 'completed'
ORDER BY progress_percentage DESC;

-- 4. Test de l'affichage
SELECT 
  'STYLE GRISE PRET' as status,
  'Les tâches terminées devraient être grisées dans le tableau de bord' as message;
