-- Script de nettoyage complet des politiques RLS
-- Executez ce script AVANT d'executer CREER_STRUCTURE_MESSAGERIE.sql

-- 1. Desactiver temporairement RLS sur toutes les tables
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE attachments DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes sur conversations
DROP POLICY IF EXISTS conversations_select_policy ON conversations;
DROP POLICY IF EXISTS conversations_insert_policy ON conversations;
DROP POLICY IF EXISTS conversations_update_policy ON conversations;
DROP POLICY IF EXISTS conversations_delete_policy ON conversations;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;

-- 3. Supprimer toutes les politiques existantes sur conversation_participants
DROP POLICY IF EXISTS participants_select_policy ON conversation_participants;
DROP POLICY IF EXISTS participants_insert_policy ON conversation_participants;
DROP POLICY IF EXISTS participants_update_policy ON conversation_participants;
DROP POLICY IF EXISTS participants_delete_policy ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert themselves as participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can remove themselves as participants" ON conversation_participants;

-- 4. Supprimer toutes les politiques existantes sur messages
DROP POLICY IF EXISTS messages_select_policy ON messages;
DROP POLICY IF EXISTS messages_insert_policy ON messages;
DROP POLICY IF EXISTS messages_update_policy ON messages;
DROP POLICY IF EXISTS messages_delete_policy ON messages;
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can insert messages as sender" ON messages;
DROP POLICY IF EXISTS "Users can update messages they sent" ON messages;
DROP POLICY IF EXISTS "Users can delete messages they sent" ON messages;

-- 5. Supprimer toutes les politiques existantes sur attachments
DROP POLICY IF EXISTS attachments_select_policy ON attachments;
DROP POLICY IF EXISTS attachments_insert_policy ON attachments;
DROP POLICY IF EXISTS attachments_update_policy ON attachments;
DROP POLICY IF EXISTS attachments_delete_policy ON attachments;
DROP POLICY IF EXISTS "Users can view attachments from their messages" ON attachments;
DROP POLICY IF EXISTS "Users can insert attachments to their messages" ON attachments;
DROP POLICY IF EXISTS "Users can update attachments from their messages" ON attachments;
DROP POLICY IF EXISTS "Users can delete attachments from their messages" ON attachments;

-- 6. Supprimer les triggers existants
DROP TRIGGER IF EXISTS trigger_update_conversation_updated_at ON messages;

-- 7. Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS update_conversation_updated_at();

-- 8. Supprimer les index existants
DROP INDEX IF EXISTS idx_conversation_participants_user_id;
DROP INDEX IF EXISTS idx_conversation_participants_conversation_id;
DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_receiver_id;
DROP INDEX IF EXISTS idx_messages_timestamp;
DROP INDEX IF EXISTS idx_attachments_message_id;

-- 9. Supprimer les tables si elles existent (ATTENTION : cela supprime toutes les donnees !)
-- Decommentez ces lignes SEULEMENT si vous voulez repartir de zero
-- DROP TABLE IF EXISTS attachments CASCADE;
-- DROP TABLE IF EXISTS conversation_participants CASCADE;
-- DROP TABLE IF EXISTS conversations CASCADE;

-- 10. Verifier qu'il ne reste plus de politiques
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'attachments')
ORDER BY tablename, policyname;

-- 11. Verifier l'etat RLS des tables
SELECT 
  tablename,
  rowsecurity as rls_active
FROM pg_tables 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'attachments')
ORDER BY tablename;

-- 12. Message de confirmation
SELECT 
  'NETTOYAGE TERMINE' as status,
  'Vous pouvez maintenant executer CREER_STRUCTURE_MESSAGERIE.sql' as instruction;
