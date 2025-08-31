-- Script de diagnostic pour les erreurs 400
-- Executez ce script dans l'editeur SQL de Supabase

-- 1. Verifier la structure de la table users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Verifier la structure de la table conversations
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- 3. Verifier les politiques RLS sur users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 4. Verifier les politiques RLS sur conversations
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

-- 5. Verifier les contraintes sur users
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
ORDER BY tc.constraint_name;

-- 6. Verifier les contraintes sur conversations
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'conversations'
ORDER BY tc.constraint_name;

-- 7. Tester l'insertion d'une conversation simple
-- (Executez cette ligne pour voir l'erreur exacte)
INSERT INTO conversations (id, created_at, updated_at) 
VALUES (gen_random_uuid(), NOW(), NOW())
RETURNING *;

-- 8. Verifier les permissions de l'utilisateur authentifie
SELECT 
  current_user,
  'JWT claims non disponibles dans ce contexte' as jwt_claims;

-- 9. Verifier si RLS est actif sur users
SELECT 
  tablename,
  rowsecurity as rls_active
FROM pg_tables 
WHERE tablename = 'users';

-- 10. Lister toutes les tables avec RLS actif
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_active
FROM pg_tables 
WHERE rowsecurity = true
ORDER BY schemaname, tablename;
