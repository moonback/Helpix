-- =====================================================
-- Script pour corriger les contraintes de la table transactions
-- =====================================================

-- 1. Vérifier les contraintes existantes
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'transactions'::regclass 
AND contype = 'c';

-- 2. Supprimer la contrainte existante si elle existe
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_reference_type_check;

-- 3. Créer une nouvelle contrainte plus permissive
ALTER TABLE transactions ADD CONSTRAINT transactions_reference_type_check 
CHECK (reference_type IN (
    'task_completion',
    'task_creation', 
    'credit_purchase',
    'manual_adjustment',
    'refund',
    'bonus',
    'referral',
    'admin_adjustment'
));

-- 4. Vérifier que la contrainte a été appliquée
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'transactions'::regclass 
AND contype = 'c'
AND conname = 'transactions_reference_type_check';

-- =====================================================
-- Fin du script de correction
-- =====================================================
