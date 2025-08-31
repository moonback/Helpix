-- Script de verification RLS simplifie
-- Executez ce script dans l'editeur SQL de Supabase

-- 1. Verifier l'etat RLS des tables de messagerie
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'attachments')
ORDER BY tablename;

-- 2. Lister toutes les politiques existantes
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
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'attachments')
ORDER BY tablename, policyname;

-- 3. Compter les politiques par table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'attachments')
GROUP BY tablename
ORDER BY tablename;

-- 4. Verifier les permissions des tables
SELECT 
  table_name,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name IN ('conversations', 'conversation_participants', 'messages', 'attachments')
  AND grantee = 'anon'
ORDER BY table_name, privilege_type;

-- 5. Verifier les contraintes de cles etrangeres
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
  AND tc.table_name IN ('conversations', 'conversation_participants', 'messages', 'attachments')
ORDER BY tc.table_name, tc.constraint_name;

-- 6. Resume de l'etat actuel
SELECT 
  'RESUME DE L''ETAT RLS' as info,
  'Tables avec RLS active: ' || 
  (SELECT COUNT(*) FROM pg_tables 
   WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'attachments') 
   AND rowsecurity = true)::text as detail;
