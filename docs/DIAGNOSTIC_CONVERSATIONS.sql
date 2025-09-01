-- Script de diagnostic pour les conversations
-- Executez ce script dans l'editeur SQL de Supabase

-- 1. Verifier la structure de la table conversations
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- 2. Verifier les contraintes de la table conversations
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'conversations';

-- 3. Verifier les politiques RLS sur conversations
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'conversations';

-- 4. Tester l'insertion d'une conversation (avec l'utilisateur authentifie)
-- Remplacez 'USER_ID_HERE' par l'ID d'un utilisateur reel
INSERT INTO conversations (participants) 
VALUES (ARRAY['USER_ID_HERE', 'ANOTHER_USER_ID_HERE'])
RETURNING *;

-- 5. Verifier les permissions de l'utilisateur authentifie
SELECT 
  current_user,
  session_user,
  current_setting('request.jwt.claims', true) as jwt_claims;

-- 6. Verifier si la table conversation_participants existe et sa structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversation_participants'
ORDER BY ordinal_position;

-- 7. Verifier les triggers sur la table conversations
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'conversations';

-- 8. Tester la creation d'une conversation simple
-- Cette requete devrait fonctionner si les politiques RLS sont correctes
SELECT 
  'Test d''insertion' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM conversations LIMIT 1
    ) THEN 'OK - Table accessible en lecture'
    ELSE 'ERREUR - Table non accessible en lecture'
  END as result;
