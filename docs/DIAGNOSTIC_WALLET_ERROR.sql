-- Script de diagnostic pour l'erreur "column wallet_id does not exist"
-- Exécutez ce script pour diagnostiquer le problème

-- 1. Vérifier si la table transactions existe
SELECT 
  table_name,
  table_type,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'transactions' 
  AND table_schema = 'public';

-- 2. Si la table existe, vérifier sa structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes de la table transactions
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'transactions' 
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_name;

-- 4. Vérifier si la table wallets existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'wallets' 
  AND table_schema = 'public';

-- 5. Vérifier la structure de la table wallets
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'wallets' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Vérifier les données existantes dans transactions (si la table existe)
-- SELECT COUNT(*) as transaction_count FROM transactions;

-- 7. Vérifier les données existantes dans wallets (si la table existe)
-- SELECT COUNT(*) as wallet_count FROM wallets;

-- Message de diagnostic
SELECT 'Diagnostic terminé - Vérifiez les résultats ci-dessus' as message;
