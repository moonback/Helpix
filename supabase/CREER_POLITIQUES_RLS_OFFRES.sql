-- Script pour créer les politiques RLS pour les offres d'aide
-- Exécutez ce script après avoir créé les tables

-- 1. Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS help_offers_select_policy ON help_offers;
DROP POLICY IF EXISTS help_offers_insert_policy ON help_offers;
DROP POLICY IF EXISTS help_offers_update_policy ON help_offers;
DROP POLICY IF EXISTS help_offers_delete_policy ON help_offers;

DROP POLICY IF EXISTS help_offer_notifications_select_policy ON help_offer_notifications;
DROP POLICY IF EXISTS help_offer_notifications_insert_policy ON help_offer_notifications;
DROP POLICY IF EXISTS help_offer_notifications_update_policy ON help_offer_notifications;
DROP POLICY IF EXISTS help_offer_notifications_delete_policy ON help_offer_notifications;

-- 2. Créer les politiques RLS pour help_offers
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

-- 3. Créer les politiques RLS pour help_offer_notifications
CREATE POLICY help_offer_notifications_select_policy ON help_offer_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY help_offer_notifications_insert_policy ON help_offer_notifications
  FOR INSERT WITH CHECK (true); -- Les notifications sont créées par le système

CREATE POLICY help_offer_notifications_update_policy ON help_offer_notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY help_offer_notifications_delete_policy ON help_offer_notifications
  FOR DELETE USING (user_id = auth.uid());

-- 4. Vérification des politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('help_offers', 'help_offer_notifications')
ORDER BY tablename, policyname;
