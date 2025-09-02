-- Script de test pour vérifier la structure du Wallet
-- Exécutez ce script après avoir créé la structure

-- 1. Vérifier que les tables existent
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('wallets', 'transactions', 'credit_earnings', 'withdrawal_requests', 'payment_methods')
ORDER BY table_name;

-- 2. Vérifier la structure de la table wallets
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'wallets' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier la structure de la table transactions
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier les contraintes de clés étrangères
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
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('wallets', 'transactions', 'credit_earnings', 'withdrawal_requests', 'payment_methods')
ORDER BY tc.table_name, tc.constraint_name;

-- 5. Vérifier les index
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('wallets', 'transactions', 'credit_earnings', 'withdrawal_requests', 'payment_methods')
ORDER BY tablename, indexname;

-- 6. Vérifier les fonctions
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('create_user_wallet', 'process_credit_earning', 'process_withdrawal_request', 'update_updated_at_column')
ORDER BY routine_name;

-- 7. Vérifier les triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND event_object_table IN ('wallets', 'auth.users')
ORDER BY event_object_table, trigger_name;

-- 8. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('wallets', 'transactions', 'credit_earnings', 'withdrawal_requests', 'payment_methods')
ORDER BY tablename, policyname;

-- 9. Vérifier la vue wallet_stats
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'wallet_stats';

-- 10. Test de création d'un wallet (simulation)
-- Note: Ce test ne fonctionnera que si vous avez un utilisateur connecté
-- SELECT 'Test de création de wallet...' as message;

-- 11. Vérifier les contraintes CHECK
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_name IN ('wallets', 'transactions', 'credit_earnings', 'withdrawal_requests', 'payment_methods')
ORDER BY tc.table_name, tc.constraint_name;

-- Message de fin
SELECT 'Test de la structure du Wallet terminé!' as message;
