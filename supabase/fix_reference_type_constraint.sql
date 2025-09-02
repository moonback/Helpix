-- Script pour corriger la contrainte reference_type de la table transactions
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer l'ancienne contrainte reference_type
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_reference_type_check;

-- 2. Ajouter la nouvelle contrainte avec tous les types de référence nécessaires
ALTER TABLE transactions ADD CONSTRAINT transactions_reference_type_check 
CHECK (reference_type IN (
  'task_completion', 
  'help_offer', 
  'withdrawal', 
  'bonus', 
  'refund', 
  'rental_payment', 
  'rental_refund',
  'rental_reserve',
  'rental_unreserve'
));

-- 3. Vérifier que la contrainte a été appliquée
SELECT 'Contrainte reference_type mise à jour:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'transactions_reference_type_check';

-- 4. Message de confirmation
SELECT 'Contrainte reference_type mise à jour avec succès!' as message;
