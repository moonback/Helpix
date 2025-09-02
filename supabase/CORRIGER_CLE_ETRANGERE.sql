-- Script pour corriger la clé étrangère helper_id
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer l'ancienne contrainte de clé étrangère
ALTER TABLE help_offers DROP CONSTRAINT IF EXISTS help_offers_helper_id_fkey;

-- 2. Ajouter la nouvelle contrainte de clé étrangère vers la table users
ALTER TABLE help_offers 
ADD CONSTRAINT help_offers_helper_id_fkey 
FOREIGN KEY (helper_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Vérifier que la contrainte a été créée
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
WHERE tc.table_name = 'help_offers' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_type;

-- 4. Test de la relation corrigée
SELECT 
  'RELATION CORRIGEE' as status,
  'helper_id pointe maintenant vers users(id)' as message;
