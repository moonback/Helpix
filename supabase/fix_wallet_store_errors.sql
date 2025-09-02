-- Script pour corriger les erreurs du wallet store
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier que les tables wallets et transactions existent
SELECT 'Tables existantes:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wallets', 'transactions')
ORDER BY table_name;

-- 2. Vérifier les colonnes de la table wallets
SELECT 'Colonnes de la table wallets:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'wallets'
ORDER BY ordinal_position;

-- 3. Vérifier les colonnes de la table transactions
SELECT 'Colonnes de la table transactions:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transactions'
ORDER BY ordinal_position;

-- 4. Vérifier les politiques RLS
SELECT 'Politiques RLS pour wallets:' as info;
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'wallets'
ORDER BY policyname;

SELECT 'Politiques RLS pour transactions:' as info;
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'transactions'
ORDER BY policyname;

-- 5. Tester l'accès aux données
SELECT 'Test d''accès aux wallets:' as info;
SELECT COUNT(*) as total_wallets FROM wallets;

SELECT 'Test d''accès aux transactions:' as info;
SELECT COUNT(*) as total_transactions FROM transactions;

-- 6. Afficher un exemple de wallet
SELECT 'Exemple de wallet:' as info;
SELECT * FROM wallets LIMIT 1;

-- 7. Afficher un exemple de transaction
SELECT 'Exemple de transaction:' as info;
SELECT * FROM transactions LIMIT 1;

-- 8. Message de confirmation
SELECT 'Diagnostic terminé - Vérifiez les résultats ci-dessus' as message;
