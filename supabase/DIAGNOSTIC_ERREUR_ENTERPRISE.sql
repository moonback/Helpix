-- 🔍 Diagnostic pour l'erreur "enterprise"
-- Ce script aide à identifier d'où vient l'erreur "invalid input syntax for type integer: enterprise"

-- 1. Vérifier la structure des tables pour identifier les colonnes de type integer
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND data_type IN ('integer', 'bigint', 'smallint')
ORDER BY table_name, column_name;

-- 2. Vérifier s'il y a des données avec "enterprise" dans les tables
-- Tâches
SELECT 'tasks' as table_name, COUNT(*) as records_found
FROM tasks 
WHERE 
  id::text ILIKE '%enterprise%' OR
  title ILIKE '%enterprise%' OR
  description ILIKE '%enterprise%' OR
  category ILIKE '%enterprise%' OR
  status ILIKE '%enterprise%' OR
  priority ILIKE '%enterprise%' OR
  location ILIKE '%enterprise%'
HAVING COUNT(*) > 0

UNION ALL

-- Transactions
SELECT 'transactions' as table_name, COUNT(*) as records_found
FROM transactions 
WHERE 
  id::text ILIKE '%enterprise%' OR
  type ILIKE '%enterprise%' OR
  description ILIKE '%enterprise%' OR
  reference_type ILIKE '%enterprise%' OR
  reference_id ILIKE '%enterprise%' OR
  status ILIKE '%enterprise%'
HAVING COUNT(*) > 0

UNION ALL

-- Wallets
SELECT 'wallets' as table_name, COUNT(*) as records_found
FROM wallets 
WHERE 
  id::text ILIKE '%enterprise%' OR
  user_id::text ILIKE '%enterprise%'
HAVING COUNT(*) > 0;

-- 3. Vérifier spécifiquement les colonnes qui pourraient causer des problèmes
-- Vérifier la colonne reference_id dans transactions (qui doit être un string mais pourrait être traitée comme integer)
SELECT 
  'Vérification reference_id dans transactions' as info,
  reference_id,
  reference_type,
  COUNT(*) as count
FROM transactions 
WHERE reference_id IS NOT NULL
GROUP BY reference_id, reference_type
HAVING reference_id ILIKE '%enterprise%';

-- 4. Vérifier les contraintes et les types de données
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  ccu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type IN ('FOREIGN KEY', 'CHECK')
ORDER BY tc.table_name, tc.constraint_name;

-- 5. Rechercher dans tous les champs JSON/JSONB
SELECT 
  'Recherche dans metadata JSON' as info,
  id,
  metadata,
  reference_type,
  reference_id
FROM transactions 
WHERE metadata::text ILIKE '%enterprise%';

-- 6. Vérifier les IDs dans toutes les tables
-- Parfois une requête essaie d'utiliser 'enterprise' comme un ID entier
SELECT 'Recherche générale enterprise' as info;

-- Si vous avez une table avec des IDs auto-incrémentés, vérifiez :
-- SELECT * FROM votre_table WHERE id = 'enterprise'; -- Ceci causera l'erreur

-- 7. Script de test pour reproduire l'erreur
-- Décommentez les lignes suivantes pour reproduire le type d'erreur :

/*
-- Ceci causera l'erreur "invalid input syntax for type integer: enterprise"
-- SELECT * FROM tasks WHERE id = 'enterprise';

-- Ou
-- INSERT INTO tasks (id, ...) VALUES ('enterprise', ...);

-- Ou
-- UPDATE tasks SET some_integer_column = 'enterprise' WHERE id = 1;
*/

-- 8. Vérifications spécifiques pour les scripts de test
SELECT 
  'Vérification des tâches de test' as info,
  id,
  title,
  budget_credits,
  status,
  user_id,
  assigned_to
FROM tasks 
WHERE title ILIKE '%test%' OR title ILIKE '%paiement%'
ORDER BY created_at DESC;

-- 9. Vérifier les transactions récentes
SELECT 
  'Transactions récentes' as info,
  id,
  type,
  amount,
  reference_type,
  reference_id,
  description,
  created_at
FROM transactions 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 10. Conseils de dépannage
SELECT 
  'CONSEILS DE DÉPANNAGE' as info,
  'L''erreur "invalid input syntax for type integer: enterprise" indique qu''une requête essaie d''utiliser la chaîne "enterprise" comme un entier.' as message
UNION ALL
SELECT 
  'CAUSES POSSIBLES' as info,
  '1. Une requête avec WHERE id = ''enterprise'' sur une colonne ID de type integer' as message
UNION ALL
SELECT 
  '' as info,
  '2. Un INSERT/UPDATE qui essaie de mettre "enterprise" dans une colonne integer' as message
UNION ALL
SELECT 
  '' as info,
  '3. Un paramètre de requête mal formaté dans l''application' as message
UNION ALL
SELECT 
  'SOLUTION' as info,
  'Vérifiez les logs de l''application et les requêtes récentes pour identifier la requête problématique' as message;
