-- =====================================================
-- Script simplifié pour corriger les contraintes de transactions
-- =====================================================

-- Supprimer la contrainte existante si elle existe
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_reference_type_check;

-- Créer une nouvelle contrainte plus permissive
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

-- =====================================================
-- Fin du script simplifié
-- =====================================================
