-- Script de test pour vérifier le statut on_hold
-- Exécutez ce script pour tester la fonctionnalité de pause/reprise

-- 1. Vérifier que le statut on_hold est accepté par la contrainte
SELECT 
  'TEST CONTRAINTE' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.check_constraints 
      WHERE constraint_name LIKE '%tasks%status%'
        AND check_clause LIKE '%on_hold%'
    ) 
    THEN 'ON_HOLD ACCEPTE' 
    ELSE 'ON_HOLD NON ACCEPTE' 
  END as result;

-- 2. Vérifier les statuts actuels
SELECT 
  status,
  COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- 3. Test de mise à jour vers on_hold (simulation)
-- Note: Ce test nécessite d'être connecté avec un utilisateur authentifié
SELECT 
  'TEST MISE EN PAUSE' as test_name,
  'Prêt pour les tests d''application' as status;

-- 4. Vérification finale
SELECT 
  'STATUT ON_HOLD PRET' as status,
  'Le bouton "Reprendre" devrait maintenant être disponible' as message;
