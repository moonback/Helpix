-- Script simple pour verifier la structure des tables
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

-- 2. Verifier la structure de la table conversation_participants
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversation_participants'
ORDER BY ordinal_position;

-- 3. Verifier la structure de la table messages
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 4. Lister toutes les tables qui commencent par 'conversation'
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'conversation%'
ORDER BY table_name;

-- 5. Lister toutes les tables qui contiennent 'message'
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%message%'
ORDER BY table_name;
