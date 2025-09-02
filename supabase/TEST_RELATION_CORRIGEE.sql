-- Script de test pour vérifier que la relation helper_id fonctionne
-- Exécutez ce script après avoir corrigé la clé étrangère

-- 1. Vérifier la contrainte de clé étrangère
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'help_offers' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_type;

-- 2. Test de sélection avec la relation corrigée
SELECT 
  h.id,
  h.status,
  h.message,
  h.created_at,
  t.title as task_title,
  u.email as helper_email
FROM help_offers h
LEFT JOIN tasks t ON t.id = h.task_id
LEFT JOIN auth.users u ON u.id = h.helper_id
ORDER BY h.created_at DESC
LIMIT 5;

-- 3. Vérifier que les utilisateurs existent dans auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
LIMIT 5;

-- 4. Test de création d'une offre (simulation)
-- Note: Ce test nécessite d'être connecté avec un utilisateur authentifié
SELECT 'RELATION TESTEE' as status, 'Prêt pour les tests d''application' as message;
