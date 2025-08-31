-- 🚀 Script de Configuration du Système de Messagerie - Entraide Universelle
-- Ce script crée toutes les tables et politiques nécessaires pour le système de messagerie

-- ============================================================================
-- 1. CRÉATION DES TABLES
-- ============================================================================

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participants aux conversations
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Mise à jour de la table messages existante
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('text', 'image', 'file')) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS isRead BOOLEAN DEFAULT FALSE;

-- Table des pièces jointes
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CRÉATION DES INDEX
-- ============================================================================

-- Index pour les conversations
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Index pour les participants
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_participants_unique ON conversation_participants(conversation_id, user_id);

-- Index pour les messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp ON messages(conversation_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_isRead ON messages(isRead);

-- Index pour les pièces jointes
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_file_type ON attachments(file_type);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_at ON attachments(uploaded_at);

-- ============================================================================
-- 3. TRIGGERS ET FONCTIONS
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
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
DROP TRIGGER IF EXISTS update_conversation_updated_at_trigger ON messages;
CREATE TRIGGER update_conversation_updated_at_trigger
  AFTER INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- Fonction pour créer automatiquement les participants d'une conversation
CREATE OR REPLACE FUNCTION create_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- Ajouter automatiquement l'expéditeur et le destinataire comme participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (NEW.conversation_id, NEW.sender_id)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (NEW.conversation_id, NEW.receiver_id)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement les participants
DROP TRIGGER IF EXISTS create_conversation_participants_trigger ON messages;
CREATE TRIGGER create_conversation_participants_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_participants();

-- ============================================================================
-- 4. ACTIVATION DU RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. POLITIQUES DE SÉCURITÉ
-- ============================================================================

-- Politiques pour les conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM conversation_participants 
      WHERE conversation_id = conversations.id
    )
  );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

-- Politiques pour les participants
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
CREATE POLICY "Users can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    auth.uid() IN (
      SELECT cp2.user_id FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
    )
  );

DROP POLICY IF EXISTS "Users can add themselves to conversations" ON conversation_participants;
CREATE POLICY "Users can add themselves to conversations" ON conversation_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour les messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM conversation_participants 
      WHERE conversation_id = messages.conversation_id
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Politiques pour les pièces jointes
DROP POLICY IF EXISTS "Users can view attachments in their conversations" ON attachments;
CREATE POLICY "Users can view attachments in their conversations" ON attachments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT cp.user_id FROM conversation_participants cp
      JOIN messages m ON m.conversation_id = cp.conversation_id
      WHERE m.id = attachments.message_id
    )
  );

DROP POLICY IF EXISTS "Users can upload attachments to their messages" ON attachments;
CREATE POLICY "Users can upload attachments to their messages" ON attachments
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT sender_id FROM messages WHERE id = attachments.message_id
    )
  );

-- ============================================================================
-- 6. CONFIGURATION DU STOCKAGE
-- ============================================================================

-- Créer le bucket pour les pièces jointes des messages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  10485760, -- 10MB
  ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage pour les pièces jointes
DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
CREATE POLICY "Users can upload message attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.uid() IN (
      SELECT sender_id FROM messages 
      WHERE id::text = (storage.foldername(name))[2]
    )
  );

DROP POLICY IF EXISTS "Users can view message attachments" ON storage.objects;
CREATE POLICY "Users can view message attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments' AND
    auth.uid() IN (
      SELECT cp.user_id FROM conversation_participants cp
      JOIN messages m ON m.conversation_id = cp.conversation_id
      WHERE m.id::text = (storage.foldername(name))[2]
    )
  );

-- ============================================================================
-- 7. FONCTIONS UTILES
-- ============================================================================

-- Fonction pour obtenir les conversations d'un utilisateur avec le dernier message
CREATE OR REPLACE FUNCTION get_user_conversations(user_uuid UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  last_message_content TEXT,
  last_message_timestamp TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    cp2.user_id as other_user_id,
    u.name as other_user_name,
    m.content as last_message_content,
    m.timestamp as last_message_timestamp,
    COUNT(CASE WHEN m2.isRead = false AND m2.receiver_id = user_uuid THEN 1 END) as unread_count
  FROM conversations c
  JOIN conversation_participants cp ON c.id = cp.conversation_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  JOIN auth.users u ON cp2.user_id = u.id
  LEFT JOIN LATERAL (
    SELECT content, timestamp
    FROM messages 
    WHERE conversation_id = c.id 
    ORDER BY timestamp DESC 
    LIMIT 1
  ) m ON true
  LEFT JOIN messages m2 ON c.id = m2.conversation_id
  WHERE cp.user_id = user_uuid AND cp2.user_id != user_uuid
  GROUP BY c.id, cp2.user_id, u.name, m.content, m.timestamp
  ORDER BY m.timestamp DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer tous les messages d'une conversation comme lus
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

-- ============================================================================
-- 8. VUES UTILES
-- ============================================================================

-- Vue des conversations avec informations utilisateur
CREATE OR REPLACE VIEW conversations_with_users AS
SELECT 
  c.id,
  c.created_at,
  c.updated_at,
  array_agg(u.name) as participant_names,
  array_agg(u.id) as participant_ids
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
JOIN auth.users u ON cp.user_id = u.id
GROUP BY c.id, c.created_at, c.updated_at;

-- Vue des messages avec informations utilisateur
CREATE OR REPLACE VIEW messages_with_users AS
SELECT 
  m.*,
  sender.name as sender_name,
  receiver.name as receiver_name
FROM messages m
JOIN auth.users sender ON m.sender_id = sender.id
JOIN auth.users receiver ON m.receiver_id = receiver.id;

-- ============================================================================
-- 9. MIGRATION DES DONNÉES EXISTANTES (si nécessaire)
-- ============================================================================

-- Si vous avez des messages existants, vous pouvez les migrer vers le nouveau système
-- Cette section est optionnelle et dépend de votre structure existante

-- Exemple de migration (à adapter selon votre cas) :
/*
-- Créer des conversations pour les messages existants
INSERT INTO conversations (id, created_at, updated_at)
SELECT DISTINCT 
  gen_random_uuid(),
  MIN(created_at),
  MAX(created_at)
FROM messages
GROUP BY sender_id, receiver_id;

-- Mettre à jour les messages existants avec les conversation_id
UPDATE messages 
SET conversation_id = c.id
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.user_id = messages.sender_id OR cp.user_id = messages.receiver_id;
*/

-- ============================================================================
-- 10. VÉRIFICATION DE LA CONFIGURATION
-- ============================================================================

-- Vérifier que toutes les tables sont créées
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'conversation_participants', 'attachments')
ORDER BY table_name;

-- Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('conversations', 'conversation_participants', 'attachments', 'messages');

-- Vérifier les politiques créées
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
WHERE tablename IN ('conversations', 'conversation_participants', 'attachments', 'messages')
ORDER BY tablename, policyname;

-- ============================================================================
-- ✅ CONFIGURATION TERMINÉE
-- ============================================================================

-- Le système de messagerie est maintenant configuré et prêt à être utilisé !
-- 
-- Fonctionnalités disponibles :
-- ✅ Conversations entre utilisateurs
-- ✅ Messages texte, images et fichiers
-- ✅ Statuts de lecture
-- ✅ Pièces jointes sécurisées
-- ✅ Politiques de sécurité RLS
-- ✅ Index optimisés pour les performances
-- 
-- Prochaines étapes :
-- 1. Tester la création de conversations
-- 2. Tester l'envoi de messages
-- 3. Tester l'upload de pièces jointes
-- 4. Vérifier les politiques de sécurité
