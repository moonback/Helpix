-- Script pour prévenir les transactions en double
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Créer un index unique pour éviter les transactions en double
-- pour les paiements de tâches (même tâche, même type, même wallet)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_task_payment_transaction 
ON transactions (reference_id, type, wallet_id) 
WHERE reference_type = 'task_completion' 
  AND type IN ('credit', 'debit');

-- 2. Créer une fonction pour vérifier et insérer une transaction de manière atomique
CREATE OR REPLACE FUNCTION insert_task_payment_transaction(
  p_wallet_id UUID,
  p_type TEXT,
  p_amount INTEGER,
  p_description TEXT,
  p_reference_id TEXT,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
BEGIN
  -- Vérifier si une transaction similaire existe déjà
  IF EXISTS (
    SELECT 1 FROM transactions 
    WHERE wallet_id = p_wallet_id 
      AND type = p_type 
      AND reference_type = 'task_completion'
      AND reference_id = p_reference_id
  ) THEN
    RAISE EXCEPTION 'Transaction déjà existante pour cette tâche et ce wallet';
  END IF;

  -- Insérer la nouvelle transaction
  INSERT INTO transactions (
    wallet_id,
    type,
    amount,
    description,
    reference_type,
    reference_id,
    status,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    p_wallet_id,
    p_type,
    p_amount,
    p_description,
    'task_completion',
    p_reference_id,
    'completed',
    p_metadata,
    NOW(),
    NOW()
  ) RETURNING id INTO transaction_id;

  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer une fonction pour traiter le paiement d'une tâche de manière atomique
CREATE OR REPLACE FUNCTION process_task_payment_atomic(
  p_task_id INTEGER,
  p_task_owner_id UUID,
  p_helper_id UUID,
  p_amount INTEGER,
  p_task_title TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  owner_wallet_id UUID;
  helper_wallet_id UUID;
  debit_transaction_id UUID;
  credit_transaction_id UUID;
  owner_balance INTEGER;
BEGIN
  -- Vérifier que la tâche existe et est terminée
  IF NOT EXISTS (
    SELECT 1 FROM tasks 
    WHERE id = p_task_id 
      AND status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Tâche non trouvée ou non terminée';
  END IF;

  -- Vérifier que le paiement n'a pas déjà été traité
  IF EXISTS (
    SELECT 1 FROM transactions 
    WHERE reference_type = 'task_completion'
      AND reference_id = p_task_id::TEXT
      AND type IN ('credit', 'debit')
  ) THEN
    RAISE EXCEPTION 'Paiement déjà traité pour cette tâche';
  END IF;

  -- Récupérer les wallets
  SELECT id INTO owner_wallet_id FROM wallets WHERE user_id = p_task_owner_id;
  SELECT id INTO helper_wallet_id FROM wallets WHERE user_id = p_helper_id;

  IF owner_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet du propriétaire non trouvé';
  END IF;

  IF helper_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet de l''aideur non trouvé';
  END IF;

  -- Vérifier le solde du propriétaire
  SELECT balance INTO owner_balance FROM wallets WHERE id = owner_wallet_id;
  IF owner_balance < p_amount THEN
    RAISE EXCEPTION 'Solde insuffisant pour le propriétaire';
  END IF;

  -- Traiter le débit du propriétaire
  SELECT insert_task_payment_transaction(
    owner_wallet_id,
    'debit',
    p_amount,
    'Paiement pour l''aide reçue sur la tâche: ' || p_task_title,
    p_task_id::TEXT,
    jsonb_build_object(
      'task_title', p_task_title,
      'task_id', p_task_id,
      'helper_user_id', p_helper_id
    )
  ) INTO debit_transaction_id;

  -- Mettre à jour le solde du propriétaire
  UPDATE wallets 
  SET 
    balance = balance - p_amount,
    total_spent = total_spent + p_amount,
    updated_at = NOW()
  WHERE id = owner_wallet_id;

  -- Traiter le crédit de l'aideur
  SELECT insert_task_payment_transaction(
    helper_wallet_id,
    'credit',
    p_amount,
    'Gain pour l''aide apportée à la tâche: ' || p_task_title,
    p_task_id::TEXT,
    jsonb_build_object(
      'task_title', p_task_title,
      'task_id', p_task_id,
      'task_owner', p_task_owner_id
    )
  ) INTO credit_transaction_id;

  -- Mettre à jour le solde de l'aideur
  UPDATE wallets 
  SET 
    balance = balance + p_amount,
    total_earned = total_earned + p_amount,
    updated_at = NOW()
  WHERE id = helper_wallet_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Commenter les fonctions pour la documentation
COMMENT ON FUNCTION insert_task_payment_transaction IS 'Insère une transaction de paiement de tâche de manière atomique';
COMMENT ON FUNCTION process_task_payment_atomic IS 'Traite le paiement complet d''une tâche de manière atomique (débit + crédit)';
