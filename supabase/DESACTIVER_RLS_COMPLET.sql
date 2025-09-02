-- Script pour desactiver completement RLS
-- ATTENTION : Cela desactive la securite des donnees !
-- Executez ce script dans l'editeur SQL de Supabase

-- 1. Desactiver RLS sur la table users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Desactiver RLS sur la table conversations
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- 3. Desactiver RLS sur la table conversation_participants
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- 4. Desactiver RLS sur la table messages
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 5. Desactiver RLS sur la table attachments
ALTER TABLE attachments DISABLE ROW LEVEL SECURITY;

-- 6. Verifier que RLS est desactive
SELECT 
  'RLS DESACTIVE' as status,
  'Verification des tables' as detail;

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_active
FROM pg_tables 
WHERE tablename IN ('users', 'conversations', 'conversation_participants', 'messages', 'attachments')
ORDER BY schemaname, tablename;

-- 7. Tester la creation d'une conversation
-- (Executez cette ligne pour verifier que ca fonctionne maintenant)
INSERT INTO conversations DEFAULT VALUES RETURNING *;

-- 8. Message de confirmation
SELECT 
  'RLS COMPLETEMENT DESACTIVE' as status,
  'Testez maintenant le bouton Contacter' as instruction;
