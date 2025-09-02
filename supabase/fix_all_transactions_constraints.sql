-- Script complet pour corriger toutes les contraintes de la table transactions
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer les anciennes contraintes
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_reference_type_check;

-- 2. Ajouter la nouvelle contrainte pour le type
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('credit', 'debit', 'withdrawal', 'refund', 'reserve', 'unreserve'));

-- 3. Ajouter la nouvelle contrainte pour le type de référence
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

-- 4. Vérifier les contraintes appliquées
SELECT 'Contraintes mises à jour:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname IN ('transactions_type_check', 'transactions_reference_type_check')
ORDER BY conname;

-- 5. Tester la structure de la table
SELECT 'Structure de la table transactions:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transactions'
ORDER BY ordinal_position;

-- 6. Message de confirmation
SELECT 'Toutes les contraintes de transactions ont été mises à jour avec succès!' as message;
