-- Script de diagnostic pour les offres d'aide
-- Exécutez ce script dans l'éditeur SQL de Supabase pour diagnostiquer les problèmes

-- 1. Vérifier si les tables existent
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE tablename IN ('help_offers', 'help_offer_notifications', 'tasks')
ORDER BY tablename;

-- 2. Vérifier la structure de la table help_offers si elle existe
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'help_offers'
ORDER BY ordinal_position;

-- 3. Vérifier les politiques RLS
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
WHERE tablename IN ('help_offers', 'help_offer_notifications')
ORDER BY tablename, policyname;

-- 4. Vérifier si RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('help_offers', 'help_offer_notifications')
ORDER BY tablename;

-- 5. Vérifier les fonctions créées
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN ('accept_help_offer', 'reject_help_offer', 'create_help_offer_notification')
ORDER BY routine_name;

-- 6. Vérifier les triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('help_offers', 'help_offer_notifications')
ORDER BY event_object_table, trigger_name;

-- 7. Test de connexion et permissions
SELECT 
  current_user as current_user,
  session_user as session_user,
  current_database() as current_database;

-- 8. Vérifier les contraintes de clés étrangères
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
WHERE tc.table_name IN ('help_offers', 'help_offer_notifications')
ORDER BY tc.table_name, tc.constraint_type;
