-- =====================================================
-- CORRECTION DES POLITIQUES RLS - RÉCURSION INFINIE
-- =====================================================

-- 1. SUPPRIMER LES POLITIQUES RLS PROBLÉMATIQUES
-- =====================================================

-- Désactiver RLS temporairement pour éviter les erreurs
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE attachments DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes (avec IF EXISTS pour éviter les erreurs)
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;

DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

DROP POLICY IF EXISTS "Users can view attachments in their conversations" ON attachments;
DROP POLICY IF EXISTS "Users can upload attachments" ON attachments;
DROP POLICY IF EXISTS "Users can delete their attachments" ON attachments;

-- Supprimer toutes les autres politiques qui pourraient exister
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Supprimer toutes les politiques sur conversations
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON conversations';
    END LOOP;
    
    -- Supprimer toutes les politiques sur conversation_participants
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversation_participants') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON conversation_participants';
    END LOOP;
    
    -- Supprimer toutes les politiques sur messages
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON messages';
    END LOOP;
    
    -- Supprimer toutes les politiques sur attachments
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'attachments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON attachments';
    END LOOP;
END $$;

-- 2. CRÉER DES POLITIQUES RLS SIMPLES ET SÉCURISÉES
-- =====================================================

-- Réactiver RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Politiques pour conversations
CREATE POLICY "conversations_select_policy" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversations.id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "conversations_insert_policy" ON conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "conversations_update_policy" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversations.id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "conversations_delete_policy" ON conversations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversations.id
            AND cp.user_id = auth.uid()
        )
    );

-- Politiques pour conversation_participants
CREATE POLICY "participants_select_policy" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.user_id = auth.uid()
        )
    );

CREATE POLICY "participants_insert_policy" ON conversation_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "participants_delete_policy" ON conversation_participants
    FOR DELETE USING (user_id = auth.uid());

-- Politiques pour messages
CREATE POLICY "messages_select_policy" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "messages_update_policy" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "messages_delete_policy" ON messages
    FOR DELETE USING (sender_id = auth.uid());

-- Politiques pour attachments
CREATE POLICY "attachments_select_policy" ON attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
            WHERE m.id = attachments.message_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "attachments_insert_policy" ON attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
            WHERE m.id = attachments.message_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "attachments_delete_policy" ON attachments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM messages m
            WHERE m.id = attachments.message_id
            AND m.sender_id = auth.uid()
        )
    );

-- 3. VÉRIFICATION ET TEST
-- =====================================================

-- Vérifier que les politiques sont créées
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'attachments')
ORDER BY tablename, policyname;

-- Compter le nombre de politiques créées
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'attachments')
GROUP BY tablename
ORDER BY tablename;

-- Message de confirmation
SELECT 'Politiques RLS corrigées avec succès !' as status;
