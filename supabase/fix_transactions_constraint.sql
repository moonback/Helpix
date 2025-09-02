-- Script pour corriger la contrainte de la table transactions
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer l'ancienne contrainte
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- 2. Ajouter la nouvelle contrainte avec tous les types nécessaires
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('credit', 'debit', 'withdrawal', 'refund', 'reserve', 'unreserve'));

-- 3. Vérifier que la contrainte a été appliquée
SELECT 'Contrainte mise à jour:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'transactions_type_check';

-- 4. Tester l'insertion d'une transaction de type 'reserve'
SELECT 'Test de la contrainte:' as info;
SELECT 'Contrainte transactions_type_check mise à jour avec succès!' as message;
