-- Script complet pour creer la structure de messagerie
-- Executez ce script dans l'editeur SQL de Supabase

-- 1. Creer la table conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Creer la table conversation_participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- 3. Modifier la table messages existante pour ajouter les colonnes manquantes
-- (si elles n'existent pas deja)
DO $$ 
BEGIN
  -- Ajouter conversation_id si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
    ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;
  
  -- Ajouter type si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'type') THEN
    ALTER TABLE messages ADD COLUMN type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file'));
  END IF;
  
  -- Ajouter timestamp si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'timestamp') THEN
    ALTER TABLE messages ADD COLUMN timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Ajouter isRead si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'isRead') THEN
    ALTER TABLE messages ADD COLUMN "isRead" BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 4. Creer la table attachments
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Creer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);

-- 6. Creer le bucket de stockage pour les pieces jointes
-- (Executez cette commande dans la console Supabase Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', true);

-- 7. Activer RLS sur toutes les tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- 8. Creer les politiques RLS pour conversations
CREATE POLICY conversations_select_policy ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY conversations_insert_policy ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY conversations_update_policy ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY conversations_delete_policy ON conversations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id 
      AND user_id = auth.uid()
    )
  );

-- 9. Creer les politiques RLS pour conversation_participants
CREATE POLICY participants_select_policy ON conversation_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY participants_insert_policy ON conversation_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY participants_update_policy ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY participants_delete_policy ON conversation_participants
  FOR DELETE USING (user_id = auth.uid());

-- 10. Creer les politiques RLS pour messages (si RLS n'est pas deja active)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages' AND rowsecurity = true) THEN
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

CREATE POLICY messages_select_policy ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY messages_insert_policy ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY messages_update_policy ON messages
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY messages_delete_policy ON messages
  FOR DELETE USING (sender_id = auth.uid());

-- 11. Creer les politiques RLS pour attachments
CREATE POLICY attachments_select_policy ON attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.id = attachments.message_id 
      AND (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
    )
  );

CREATE POLICY attachments_insert_policy ON attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.id = attachments.message_id 
      AND messages.sender_id = auth.uid()
    )
  );

CREATE POLICY attachments_update_policy ON attachments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.id = attachments.message_id 
      AND messages.sender_id = auth.uid()
    )
  );

CREATE POLICY attachments_delete_policy ON attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.id = attachments.message_id 
      AND messages.sender_id = auth.uid()
    )
  );

-- 12. Creer un trigger pour mettre a jour updated_at sur conversations
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_updated_at
  AFTER INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- 13. Verifier que tout a ete cree
SELECT 
  'RESUME DE LA CREATION' as info,
  'Tables creees avec succes' as detail;

SELECT 
  tablename,
  rowsecurity as rls_active
FROM pg_tables 
WHERE tablename IN ('conversations', 'conversation_participants', 'attachments')
ORDER BY tablename;
