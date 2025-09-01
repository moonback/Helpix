-- Script pour vérifier et créer les tables d'offres d'aide si nécessaire
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si les tables existent
DO $$
BEGIN
    -- Vérifier help_offers
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'help_offers') THEN
        RAISE NOTICE 'Table help_offers n''existe pas - création nécessaire';
    ELSE
        RAISE NOTICE 'Table help_offers existe déjà';
    END IF;
    
    -- Vérifier help_offer_notifications
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'help_offer_notifications') THEN
        RAISE NOTICE 'Table help_offer_notifications n''existe pas - création nécessaire';
    ELSE
        RAISE NOTICE 'Table help_offer_notifications existe déjà';
    END IF;
END $$;

-- 2. Créer help_offers si elle n'existe pas
CREATE TABLE IF NOT EXISTS help_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  helper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
  message TEXT,
  proposed_duration INTEGER,
  proposed_credits INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_message TEXT,
  UNIQUE(task_id, helper_id)
);

-- 3. Créer help_offer_notifications si elle n'existe pas
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

-- 4. Créer les index si nécessaire
CREATE INDEX IF NOT EXISTS idx_help_offers_task_id ON help_offers(task_id);
CREATE INDEX IF NOT EXISTS idx_help_offers_helper_id ON help_offers(helper_id);
CREATE INDEX IF NOT EXISTS idx_help_offers_status ON help_offers(status);
CREATE INDEX IF NOT EXISTS idx_help_offers_created_at ON help_offers(created_at);
CREATE INDEX IF NOT EXISTS idx_help_offer_notifications_user_id ON help_offer_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_help_offer_notifications_is_read ON help_offer_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_help_offer_notifications_created_at ON help_offer_notifications(created_at);

-- 5. Activer RLS si nécessaire
ALTER TABLE help_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_offer_notifications ENABLE ROW LEVEL SECURITY;

-- 6. Vérification finale
SELECT 
  'TABLES VERIFIEES' as status,
  COUNT(*) as help_offers_count
FROM help_offers;

SELECT 
  'NOTIFICATIONS VERIFIEES' as status,
  COUNT(*) as notifications_count
FROM help_offer_notifications;
