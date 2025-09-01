-- Script pour créer la structure des offres d'aide
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Créer la table help_offers (offres d'aide)
CREATE TABLE IF NOT EXISTS help_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  helper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
  message TEXT, -- Message personnalisé du helper
  proposed_duration INTEGER, -- Durée proposée par le helper (en heures)
  proposed_credits INTEGER, -- Crédits proposés par le helper
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE, -- Quand le propriétaire a répondu
  response_message TEXT, -- Message de réponse du propriétaire
  UNIQUE(task_id, helper_id) -- Un helper ne peut faire qu'une offre par tâche
);

-- 2. Créer la table help_offer_notifications (notifications)
CREATE TABLE IF NOT EXISTS help_offer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  help_offer_id UUID REFERENCES help_offers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('new_offer', 'offer_accepted', 'offer_rejected', 'offer_cancelled')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_help_offers_task_id ON help_offers(task_id);
CREATE INDEX IF NOT EXISTS idx_help_offers_helper_id ON help_offers(helper_id);
CREATE INDEX IF NOT EXISTS idx_help_offers_status ON help_offers(status);
CREATE INDEX IF NOT EXISTS idx_help_offers_created_at ON help_offers(created_at);
CREATE INDEX IF NOT EXISTS idx_help_offer_notifications_user_id ON help_offer_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_help_offer_notifications_is_read ON help_offer_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_help_offer_notifications_created_at ON help_offer_notifications(created_at);

-- 4. Activer RLS sur les nouvelles tables
ALTER TABLE help_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_offer_notifications ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS pour help_offers
CREATE POLICY help_offers_select_policy ON help_offers
  FOR SELECT USING (
    -- Le propriétaire de la tâche peut voir toutes les offres
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = help_offers.task_id 
      AND tasks.user_id = auth.uid()
    )
    OR
    -- Le helper peut voir ses propres offres
    helper_id = auth.uid()
  );

CREATE POLICY help_offers_insert_policy ON help_offers
  FOR INSERT WITH CHECK (
    -- Seul le helper peut créer une offre
    helper_id = auth.uid()
    AND
    -- Le helper ne peut pas faire d'offre sur sa propre tâche
    NOT EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = help_offers.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY help_offers_update_policy ON help_offers
  FOR UPDATE USING (
    -- Le propriétaire de la tâche peut accepter/rejeter
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = help_offers.task_id 
      AND tasks.user_id = auth.uid()
    )
    OR
    -- Le helper peut annuler ses offres en attente
    (helper_id = auth.uid() AND status = 'pending')
  );

CREATE POLICY help_offers_delete_policy ON help_offers
  FOR DELETE USING (
    -- Le propriétaire de la tâche peut supprimer
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = help_offers.task_id 
      AND tasks.user_id = auth.uid()
    )
    OR
    -- Le helper peut supprimer ses propres offres
    helper_id = auth.uid()
  );

-- 6. Créer les politiques RLS pour help_offer_notifications
CREATE POLICY help_offer_notifications_select_policy ON help_offer_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY help_offer_notifications_insert_policy ON help_offer_notifications
  FOR INSERT WITH CHECK (true); -- Les notifications sont créées par le système

CREATE POLICY help_offer_notifications_update_policy ON help_offer_notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY help_offer_notifications_delete_policy ON help_offer_notifications
  FOR DELETE USING (user_id = auth.uid());

-- 7. Créer les triggers pour les notifications automatiques
CREATE OR REPLACE FUNCTION create_help_offer_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notification pour le propriétaire de la tâche
  INSERT INTO help_offer_notifications (
    help_offer_id,
    user_id,
    type,
    title,
    message
  )
  SELECT 
    NEW.id,
    t.user_id,
    'new_offer',
    'Nouvelle offre d''aide reçue',
    'Quelqu''un souhaite vous aider avec votre tâche "' || t.title || '"'
  FROM tasks t
  WHERE t.id = NEW.task_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_help_offer_notification
  AFTER INSERT ON help_offers
  FOR EACH ROW
  EXECUTE FUNCTION create_help_offer_notification();

-- 8. Trigger pour les réponses aux offres
CREATE OR REPLACE FUNCTION create_help_offer_response_notification()
RETURNS TRIGGER AS $$
DECLARE
  task_title TEXT;
  notification_type TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Récupérer le titre de la tâche
  SELECT title INTO task_title FROM tasks WHERE id = NEW.task_id;
  
  -- Déterminer le type de notification
  IF NEW.status = 'accepted' THEN
    notification_type := 'offer_accepted';
    notification_title := 'Votre offre d''aide a été acceptée !';
    notification_message := 'Votre offre pour la tâche "' || task_title || '" a été acceptée. Vous pouvez maintenant commencer à aider.';
  ELSIF NEW.status = 'rejected' THEN
    notification_type := 'offer_rejected';
    notification_title := 'Votre offre d''aide a été refusée';
    notification_message := 'Votre offre pour la tâche "' || task_title || '" a été refusée.';
  END IF;
  
  -- Créer la notification pour le helper
  IF notification_type IS NOT NULL THEN
    INSERT INTO help_offer_notifications (
      help_offer_id,
      user_id,
      type,
      title,
      message
    ) VALUES (
      NEW.id,
      NEW.helper_id,
      notification_type,
      notification_title,
      notification_message
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_help_offer_response_notification
  AFTER UPDATE ON help_offers
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected'))
  EXECUTE FUNCTION create_help_offer_response_notification();

-- 9. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_help_offer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_help_offer_updated_at
  BEFORE UPDATE ON help_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_help_offer_updated_at();

-- 10. Fonction pour accepter une offre d'aide
CREATE OR REPLACE FUNCTION accept_help_offer(offer_id UUID, response_msg TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  task_record RECORD;
  offer_record RECORD;
BEGIN
  -- Récupérer l'offre
  SELECT * INTO offer_record
  FROM help_offers
  WHERE id = offer_id AND status = 'pending';
  
  -- Vérifier que l'offre existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offre non trouvée ou déjà traitée';
  END IF;
  
  -- Récupérer la tâche
  SELECT * INTO task_record
  FROM tasks
  WHERE id = offer_record.task_id;
  
  -- Vérifier que l'utilisateur est le propriétaire de la tâche
  IF task_record.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Vous n''êtes pas autorisé à accepter cette offre';
  END IF;
  
  -- Vérifier que la tâche est toujours ouverte
  IF task_record.status != 'open' THEN
    RAISE EXCEPTION 'Cette tâche n''est plus disponible';
  END IF;
  
  -- Accepter l'offre
  UPDATE help_offers 
  SET 
    status = 'accepted',
    responded_at = NOW(),
    response_message = response_msg
  WHERE id = offer_id;
  
  -- Mettre à jour la tâche
  UPDATE tasks 
  SET 
    status = 'in_progress',
    assigned_to = offer_record.helper_id,
    updated_at = NOW()
  WHERE id = task_record.id;
  
  -- Rejeter toutes les autres offres en attente pour cette tâche
  UPDATE help_offers 
  SET 
    status = 'rejected',
    responded_at = NOW(),
    response_message = 'Une autre offre a été acceptée'
  WHERE task_id = task_record.id 
    AND status = 'pending' 
    AND id != offer_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Fonction pour rejeter une offre d'aide
CREATE OR REPLACE FUNCTION reject_help_offer(offer_id UUID, response_msg TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  task_record RECORD;
  offer_record RECORD;
BEGIN
  -- Récupérer l'offre
  SELECT * INTO offer_record
  FROM help_offers
  WHERE id = offer_id AND status = 'pending';
  
  -- Vérifier que l'offre existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offre non trouvée ou déjà traitée';
  END IF;
  
  -- Récupérer la tâche
  SELECT * INTO task_record
  FROM tasks
  WHERE id = offer_record.task_id;
  
  -- Vérifier que l'utilisateur est le propriétaire de la tâche
  IF task_record.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Vous n''êtes pas autorisé à rejeter cette offre';
  END IF;
  
  -- Rejeter l'offre
  UPDATE help_offers 
  SET 
    status = 'rejected',
    responded_at = NOW(),
    response_message = response_msg
  WHERE id = offer_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Vérification finale
SELECT 
  'STRUCTURE DES OFFRES D''AIDE CREEES' as info,
  'Tables et fonctions créées avec succès' as detail;

SELECT 
  tablename,
  rowsecurity as rls_active
FROM pg_tables 
WHERE tablename IN ('help_offers', 'help_offer_notifications')
ORDER BY tablename;
