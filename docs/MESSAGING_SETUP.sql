-- =====================================================
-- SYSTÈME DE MESSAGERIE COMPLET - SETUP CORRIGÉ
-- =====================================================

-- 1. CRÉATION DES TABLES DE MESSAGERIE
-- =====================================================

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participants aux conversations
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- 2. MODIFICATION DE LA TABLE MESSAGES EXISTANTE
-- =====================================================

-- D'abord, supprimer les contraintes existantes si elles existent
DO $$ 
BEGIN
    -- Supprimer la contrainte de clé étrangère si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_sender_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT messages_sender_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_receiver_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT messages_receiver_id_fkey;
    END IF;
    
    -- Supprimer la contrainte de clé primaire si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_pkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT messages_pkey;
    END IF;
END $$;

-- Créer une nouvelle colonne id de type UUID
ALTER TABLE messages ADD COLUMN IF NOT EXISTS new_id UUID DEFAULT gen_random_uuid();

-- Mettre à jour les nouvelles colonnes id avec des UUIDs uniques
UPDATE messages SET new_id = gen_random_uuid() WHERE new_id IS NULL;

-- Supprimer l'ancienne colonne id
ALTER TABLE messages DROP COLUMN id;

-- Renommer la nouvelle colonne
ALTER TABLE messages RENAME COLUMN new_id TO id;

-- Ajouter la contrainte de clé primaire
ALTER TABLE messages ADD PRIMARY KEY (id);

-- Ajouter les nouvelles colonnes nécessaires
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN DEFAULT FALSE;

-- Recréer les contraintes de clé étrangère pour sender_id et receiver_id
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_receiver_id_fkey 
    FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. CRÉATION DE LA TABLE DES PIÈCES JOINTES
-- =====================================================

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRÉATION DES INDEXES
-- =====================================================

-- Index pour les conversations
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Index pour les participants
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);

-- Index pour les messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages("isRead");

-- Index pour les pièces jointes
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_file_type ON attachments(file_type);

-- 5. CRÉATION DES TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at des conversations
DROP TRIGGER IF EXISTS trigger_update_conversation_updated_at ON messages;
CREATE TRIGGER trigger_update_conversation_updated_at
    AFTER INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_updated_at();

-- Fonction pour créer automatiquement les participants
CREATE OR REPLACE FUNCTION create_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
    -- Insérer l'expéditeur
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (NEW.conversation_id, NEW.sender_id)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
    
    -- Insérer le destinataire (si différent de l'expéditeur)
    IF NEW.receiver_id IS NOT NULL AND NEW.receiver_id != NEW.sender_id THEN
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (NEW.conversation_id, NEW.receiver_id)
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement les participants
DROP TRIGGER IF EXISTS trigger_create_conversation_participants ON messages;
CREATE TRIGGER trigger_create_conversation_participants
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION create_conversation_participants();

-- 6. ACTIVATION DE RLS ET CRÉATION DES POLITIQUES
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Politiques pour les conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (true);

-- Politiques pour les participants
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join conversations" ON conversation_participants
    FOR INSERT WITH CHECK (true);

-- Politiques pour les messages
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to conversations they participate in" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Politiques pour les pièces jointes
CREATE POLICY "Users can view attachments in their conversations" ON attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = attachments.message_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload attachments to their messages" ON attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = attachments.message_id AND cp.user_id = auth.uid()
        )
    );

-- 7. CONFIGURATION DU STOCKAGE SUPABASE
-- =====================================================

-- Créer le bucket pour les pièces jointes
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage pour les pièces jointes
CREATE POLICY "Users can upload attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'message-attachments' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view attachments in their conversations" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'message-attachments' AND
        EXISTS (
            SELECT 1 FROM attachments a
            JOIN messages m ON a.message_id = m.id
            JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE a.file_url LIKE '%' || name || '%' AND cp.user_id = auth.uid()
        )
    );

-- 8. FONCTIONS UTILES
-- =====================================================

-- Fonction pour obtenir les conversations d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_conversations(user_uuid UUID)
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    last_message_text TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        cp2.user_id as other_user_id,
        p.raw_user_meta_data->>'full_name' as other_user_name,
        m.content as last_message_text,
        m.timestamp as last_message_time,
        COUNT(CASE WHEN m."isRead" = false AND m.receiver_id = user_uuid THEN 1 END) as unread_count
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    JOIN auth.users p ON cp2.user_id = p.id
    LEFT JOIN LATERAL (
        SELECT content, timestamp, "isRead", receiver_id
        FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY timestamp DESC 
        LIMIT 1
    ) m ON true
    WHERE cp1.user_id = user_uuid AND cp2.user_id != user_uuid
    GROUP BY c.id, cp2.user_id, p.raw_user_meta_data->>'full_name', m.content, m.timestamp
    ORDER BY m.timestamp DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer une conversation comme lue
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conv_id UUID, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE messages 
    SET "isRead" = true 
    WHERE conversation_id = conv_id 
    AND receiver_id = user_uuid 
    AND "isRead" = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insérer quelques conversations de test si nécessaire
-- (Décommentez si vous voulez des données de test)

/*
INSERT INTO conversations (id) VALUES 
    (gen_random_uuid()),
    (gen_random_uuid());

-- Insérer des participants de test
INSERT INTO conversation_participants (conversation_id, user_id)
SELECT c.id, u.id
FROM conversations c
CROSS JOIN auth.users u
LIMIT 4;
*/

-- 10. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que toutes les tables ont été créées
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('conversations', 'conversation_participants', 'messages', 'attachments')
ORDER BY table_name, ordinal_position;

-- Vérifier les contraintes de clé étrangère
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('conversations', 'conversation_participants', 'messages', 'attachments');
