-- Script pour ajouter un système de wallet de caution (escrow)
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Créer la table escrow_wallets pour les cautions
CREATE TABLE IF NOT EXISTS escrow_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID REFERENCES public.rentals(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'held' CHECK (status IN ('held', 'released', 'forfeited')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- 2. Ajouter les nouveaux types de transactions pour les cautions
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('credit', 'debit', 'withdrawal', 'refund', 'reserve', 'unreserve', 'escrow_hold', 'escrow_release'));

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_reference_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_reference_type_check 
CHECK (reference_type IN (
  'task_completion', 
  'help_offer', 
  'withdrawal', 
  'bonus', 
  'refund', 
  'rental_payment', 
  'rental_refund',
  'rental_reserve',
  'rental_unreserve',
  'rental_deposit',
  'rental_deposit_refund',
  'escrow_deposit',
  'escrow_release'
));

-- 3. Fonction pour bloquer une caution dans l'escrow
CREATE OR REPLACE FUNCTION hold_escrow_deposit(
  p_rental_id UUID,
  p_amount DECIMAL(10,2),
  p_renter_id UUID
) RETURNS UUID AS $$
DECLARE
  v_escrow_id UUID;
  v_wallet_id UUID;
BEGIN
  -- Récupérer le wallet du locataire
  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = p_renter_id;
  
  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet non trouvé pour l''utilisateur %', p_renter_id;
  END IF;
  
  -- Vérifier que le locataire a suffisamment de crédits
  IF (SELECT balance FROM wallets WHERE id = v_wallet_id) < p_amount THEN
    RAISE EXCEPTION 'Solde insuffisant pour la caution';
  END IF;
  
  -- Débiter le locataire
  UPDATE wallets 
  SET balance = balance - p_amount 
  WHERE id = v_wallet_id;
  
  -- Créer l'enregistrement escrow
  INSERT INTO escrow_wallets (rental_id, amount, status)
  VALUES (p_rental_id, p_amount, 'held')
  RETURNING id INTO v_escrow_id;
  
  -- Enregistrer la transaction
  INSERT INTO transactions (wallet_id, type, amount, description, reference_type, reference_id)
  VALUES (v_wallet_id, 'escrow_hold', p_amount, 'Caution bloquée - Location #' || p_rental_id, 'escrow_deposit', p_rental_id);
  
  RETURN v_escrow_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fonction pour libérer une caution de l'escrow
CREATE OR REPLACE FUNCTION release_escrow_deposit(
  p_rental_id UUID,
  p_renter_id UUID,
  p_reason TEXT DEFAULT 'Location terminée'
) RETURNS BOOLEAN AS $$
DECLARE
  v_escrow_record RECORD;
  v_wallet_id UUID;
BEGIN
  -- Récupérer l'enregistrement escrow
  SELECT * INTO v_escrow_record FROM escrow_wallets WHERE rental_id = p_rental_id AND status = 'held';
  
  IF v_escrow_record IS NULL THEN
    RAISE EXCEPTION 'Aucune caution trouvée pour cette location';
  END IF;
  
  -- Récupérer le wallet du locataire
  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = p_renter_id;
  
  -- Créditer le locataire
  UPDATE wallets 
  SET balance = balance + v_escrow_record.amount 
  WHERE id = v_wallet_id;
  
  -- Marquer la caution comme libérée
  UPDATE escrow_wallets 
  SET status = 'released', released_at = NOW()
  WHERE id = v_escrow_record.id;
  
  -- Enregistrer la transaction
  INSERT INTO transactions (wallet_id, type, amount, description, reference_type, reference_id)
  VALUES (v_wallet_id, 'escrow_release', v_escrow_record.amount, 'Caution libérée - ' || p_reason, 'escrow_release', p_rental_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fonction pour confisquer une caution (en cas de dommage)
CREATE OR REPLACE FUNCTION forfeit_escrow_deposit(
  p_rental_id UUID,
  p_owner_id UUID,
  p_reason TEXT DEFAULT 'Dommage constaté'
) RETURNS BOOLEAN AS $$
DECLARE
  v_escrow_record RECORD;
  v_owner_wallet_id UUID;
BEGIN
  -- Récupérer l'enregistrement escrow
  SELECT * INTO v_escrow_record FROM escrow_wallets WHERE rental_id = p_rental_id AND status = 'held';
  
  IF v_escrow_record IS NULL THEN
    RAISE EXCEPTION 'Aucune caution trouvée pour cette location';
  END IF;
  
  -- Récupérer le wallet du propriétaire
  SELECT id INTO v_owner_wallet_id FROM wallets WHERE user_id = p_owner_id;
  
  -- Créditer le propriétaire (compensation pour dommage)
  UPDATE wallets 
  SET balance = balance + v_escrow_record.amount 
  WHERE id = v_owner_wallet_id;
  
  -- Marquer la caution comme confisquée
  UPDATE escrow_wallets 
  SET status = 'forfeited', released_at = NOW()
  WHERE id = v_escrow_record.id;
  
  -- Enregistrer la transaction
  INSERT INTO transactions (wallet_id, type, amount, description, reference_type, reference_id)
  VALUES (v_owner_wallet_id, 'credit', v_escrow_record.amount, 'Compensation dommage - ' || p_reason, 'rental_payment', p_rental_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS pour escrow_wallets
ALTER TABLE escrow_wallets ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux propriétaires et locataires de voir leurs cautions
CREATE POLICY "escrow_select_own" ON escrow_wallets
  FOR SELECT USING (
    rental_id IN (
      SELECT id FROM rentals 
      WHERE owner_id = auth.uid() OR renter_id = auth.uid()
    )
  );

-- Politique pour permettre l'insertion par le système
CREATE POLICY "escrow_insert_system" ON escrow_wallets
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour par le système
CREATE POLICY "escrow_update_system" ON escrow_wallets
  FOR UPDATE USING (true);

-- 7. Index pour optimiser les performances
CREATE INDEX idx_escrow_wallets_rental_id ON escrow_wallets(rental_id);
CREATE INDEX idx_escrow_wallets_status ON escrow_wallets(status);
CREATE INDEX idx_escrow_wallets_created_at ON escrow_wallets(created_at DESC);

-- 8. Vérification
SELECT 'Système de wallet de caution créé avec succès!' as message;
