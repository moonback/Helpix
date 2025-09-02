-- Script pour améliorer le système de wallet avec gestion des crédits réservés
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter une colonne pour les crédits réservés
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS reserved_credits DECIMAL(10,2) DEFAULT 0 NOT NULL;

-- 2. Mettre à jour la fonction update_user_credits pour gérer les crédits réservés
CREATE OR REPLACE FUNCTION update_user_credits(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_type VARCHAR(20),
  p_description TEXT,
  p_reference_type VARCHAR(50),
  p_reference_id VARCHAR(255) DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  user_wallet wallets%ROWTYPE;
  transaction_amount DECIMAL(10,2);
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Récupérer le wallet de l'utilisateur
  SELECT * INTO user_wallet FROM wallets WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Créer un wallet si il n'existe pas
    INSERT INTO wallets (user_id, balance, total_earned, total_spent, reserved_credits)
    VALUES (p_user_id, 100, 100, 0, 0);
    SELECT * INTO user_wallet FROM wallets WHERE user_id = p_user_id;
  END IF;
  
  -- Déterminer le montant de la transaction
  transaction_amount := ABS(p_amount);
  
  -- Vérifier le solde disponible pour les débits (balance - reserved_credits)
  IF p_type = 'debit' AND (user_wallet.balance - user_wallet.reserved_credits) < transaction_amount THEN
    RAISE EXCEPTION 'Solde insuffisant. Crédits disponibles: %', (user_wallet.balance - user_wallet.reserved_credits);
  END IF;
  
  -- Mettre à jour le wallet selon le type de transaction
  IF p_type = 'credit' THEN
    UPDATE wallets 
    SET 
      balance = balance + transaction_amount,
      total_earned = total_earned + transaction_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_type = 'debit' THEN
    UPDATE wallets 
    SET 
      balance = balance - transaction_amount,
      total_spent = total_spent + transaction_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_type = 'reserve' THEN
    -- Réserver des crédits (pour les demandes en attente)
    UPDATE wallets 
    SET 
      reserved_credits = reserved_credits + transaction_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_type = 'unreserve' THEN
    -- Libérer des crédits réservés
    UPDATE wallets 
    SET 
      reserved_credits = GREATEST(0, reserved_credits - transaction_amount),
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Créer une transaction
  INSERT INTO transactions (
    wallet_id, type, amount, description, 
    reference_type, reference_id, status, metadata
  ) VALUES (
    user_wallet.id, p_type, transaction_amount, p_description,
    p_reference_type, p_reference_id, 'completed', p_metadata
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 3. Fonction pour réserver des crédits lors d'une demande
CREATE OR REPLACE FUNCTION reserve_rental_credits(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_rental_id VARCHAR(255)
)
RETURNS VOID AS $$
DECLARE
  user_wallet wallets%ROWTYPE;
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Récupérer le wallet de l'utilisateur
  SELECT * INTO user_wallet FROM wallets WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Créer un wallet si il n'existe pas
    INSERT INTO wallets (user_id, balance, total_earned, total_spent, reserved_credits)
    VALUES (p_user_id, 100, 100, 0, 0);
    SELECT * INTO user_wallet FROM wallets WHERE user_id = p_user_id;
  END IF;
  
  -- Vérifier le solde disponible
  IF (user_wallet.balance - user_wallet.reserved_credits) < p_amount THEN
    RAISE EXCEPTION 'Solde insuffisant. Crédits disponibles: %', (user_wallet.balance - user_wallet.reserved_credits);
  END IF;
  
  -- Réserver les crédits
  UPDATE wallets 
  SET 
    reserved_credits = reserved_credits + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Créer une transaction de réservation
  INSERT INTO transactions (
    wallet_id, type, amount, description, 
    reference_type, reference_id, status, metadata
  ) VALUES (
    user_wallet.id, 'reserve', p_amount, 
    'Réservation crédits - Location #' || p_rental_id,
    'rental_payment', p_rental_id, 'completed',
    jsonb_build_object('rental_id', p_rental_id, 'status', 'reserved')
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 4. Fonction pour libérer des crédits réservés
CREATE OR REPLACE FUNCTION unreserve_rental_credits(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_rental_id VARCHAR(255),
  p_reason TEXT
)
RETURNS VOID AS $$
DECLARE
  user_wallet wallets%ROWTYPE;
BEGIN
  -- Libérer les crédits réservés
  UPDATE wallets 
  SET 
    reserved_credits = GREATEST(0, reserved_credits - p_amount),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Récupérer le wallet pour l'ID
  SELECT * INTO user_wallet FROM wallets WHERE user_id = p_user_id;
  
  -- Créer une transaction de libération
  INSERT INTO transactions (
    wallet_id, type, amount, description, 
    reference_type, reference_id, status, metadata
  ) VALUES (
    user_wallet.id, 'unreserve', p_amount, 
    'Libération crédits - ' || p_reason || ' - Location #' || p_rental_id,
    'rental_refund', p_rental_id, 'completed',
    jsonb_build_object('rental_id', p_rental_id, 'reason', p_reason)
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 5. Mettre à jour les wallets existants
UPDATE wallets SET reserved_credits = 0 WHERE reserved_credits IS NULL;

-- 6. Message de confirmation
SELECT 'Système de wallet amélioré avec gestion des crédits réservés!' as message;
