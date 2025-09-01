-- 🔧 Script de correction pour l'erreur "enterprise"
-- Ce script corrige les problèmes potentiels liés à l'erreur "invalid input syntax for type integer: enterprise"

-- 1. D'abord, identifier le problème
SELECT 'DIAGNOSTIC: Recherche de données problématiques' as action;

-- Vérifier les transactions avec des reference_id potentiellement problématiques
SELECT 
  'Transactions avec reference_id non numérique:' as info,
  id,
  reference_id,
  reference_type,
  description
FROM transactions 
WHERE reference_id IS NOT NULL
  AND reference_id !~ '^[0-9]+$'  -- Recherche les reference_id qui ne sont pas uniquement des chiffres
ORDER BY created_at DESC;

-- 2. Vérifier les tâches avec des IDs problématiques
-- (Normalement les IDs sont auto-générés et ne devraient pas avoir ce problème)

-- 3. Si le problème vient d'une requête qui essaie d'utiliser 'enterprise' comme ID
-- Voici comment corriger différents scénarios :

-- Scénario 1: Si 'enterprise' a été inséré par erreur dans une colonne integer
-- (Peu probable car cela aurait causé l'erreur à l'insertion)

-- Scénario 2: Si le problème vient d'une requête mal formée dans l'application
-- Pas de correction SQL nécessaire, le problème est dans le code

-- 4. Nettoyage des données de test potentiellement problématiques
-- Supprimer les tâches de test récentes si elles causent des problèmes
/*
DELETE FROM transactions 
WHERE reference_type = 'task_completion' 
  AND reference_id IN (
    SELECT id::text FROM tasks 
    WHERE title ILIKE '%test%' AND created_at >= NOW() - INTERVAL '1 hour'
  );

DELETE FROM tasks 
WHERE title ILIKE '%test%' 
  AND created_at >= NOW() - INTERVAL '1 hour';
*/

-- 5. Vérification des contraintes
-- S'assurer que toutes les contraintes sont correctes
SELECT 
  'Vérification des contraintes:' as info,
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table,
  contype as constraint_type
FROM pg_constraint
WHERE contype IN ('f', 'c')  -- Foreign key et Check constraints
  AND conrelid::regclass::text IN ('tasks', 'transactions', 'wallets')
ORDER BY table_name, constraint_name;

-- 6. Recréer les index si nécessaire
-- REINDEX TABLE tasks;
-- REINDEX TABLE transactions;
-- REINDEX TABLE wallets;

-- 7. Vérifier l'intégrité des données après correction
SELECT 
  'Vérification post-correction:' as info,
  COUNT(*) as total_tasks
FROM tasks;

SELECT 
  'Transactions valides:' as info,
  COUNT(*) as total_transactions
FROM transactions 
WHERE reference_id IS NULL 
   OR reference_id ~ '^[0-9]+$';  -- Seulement les reference_id numériques ou NULL

-- 8. Test de requête sécurisée
-- Pour éviter l'erreur, toujours utiliser des paramètres typés
-- Exemple de requête sécurisée vs non sécurisée :

-- ❌ MAUVAIS (peut causer l'erreur) :
-- SELECT * FROM tasks WHERE id = 'enterprise';

-- ✅ BON :
-- SELECT * FROM tasks WHERE id = $1; (avec paramètre integer)

-- 9. Script de vérification finale
SELECT 
  'VÉRIFICATION FINALE' as status,
  'Si ce script s''exécute sans erreur, le problème "enterprise" est probablement résolu' as message
UNION ALL
SELECT 
  'NEXT STEPS' as status,
  'Si l''erreur persiste, vérifiez le code de l''application pour les requêtes mal formées' as message
UNION ALL
SELECT 
  'APPLICATION' as status,
  'Recherchez dans le code : WHERE id = ''enterprise'' ou des paramètres mal typés' as message;
