-- Script pour vérifier la structure de la table users
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de auth.users
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Vérifier la structure de la table users (si elle existe)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Vérifier les données dans auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
LIMIT 5;

-- 4. Vérifier les données dans la table users (si elle existe)
SELECT 
  id,
  name,
  email,
  avatar_url
FROM users
LIMIT 5;
