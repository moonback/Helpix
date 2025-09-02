-- Script pour corriger le système de wallet et l'intégrer avec le marketplace
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer les tables existantes si elles existent (pour repartir proprement)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS credit_earnings CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;

-- 2. Créer la table wallets avec la bonne référence
CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_earned DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Créer la table transactions
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'withdrawal', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('task_completion', 'help_offer', 'withdrawal', 'bonus', 'refund', 'rental_payment', 'rental_refund')),
  reference_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- 4. Index pour optimiser les performances
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- 5. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Trigger pour wallets
CREATE TRIGGER update_wallets_updated_at 
  BEFORE UPDATE ON wallets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Fonction pour créer automatiquement un wallet
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 100, 100, 0); -- Donner 100 crédits de bienvenue
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger pour créer un wallet à l'inscription
DROP TRIGGER IF EXISTS create_wallet_on_signup ON public.users;
CREATE TRIGGER create_wallet_on_signup
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- 9. Fonction pour mettre à jour les crédits d'un utilisateur
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
    INSERT INTO wallets (user_id, balance, total_earned, total_spent)
    VALUES (p_user_id, 100, 100, 0);
    SELECT * INTO user_wallet FROM wallets WHERE user_id = p_user_id;
  END IF;
  
  -- Déterminer le montant de la transaction
  transaction_amount := ABS(p_amount);
  
  -- Vérifier le solde pour les débits
  IF p_type = 'debit' AND user_wallet.balance < transaction_amount THEN
    RAISE EXCEPTION 'Solde insuffisant';
  END IF;
  
  -- Mettre à jour le wallet
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

-- 10. RLS (Row Level Security) Policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies pour wallets
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallets;
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wallet" ON wallets;
CREATE POLICY "Users can update their own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wallet" ON wallets;
CREATE POLICY "Users can insert their own wallet" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies pour transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM wallets WHERE id = wallet_id));

DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM wallets WHERE id = wallet_id));

-- Politique pour permettre aux fonctions système de gérer les wallets
DROP POLICY IF EXISTS "System can manage wallets" ON wallets;
CREATE POLICY "System can manage wallets" ON wallets
  FOR ALL USING (true);

DROP POLICY IF EXISTS "System can manage transactions" ON transactions;
CREATE POLICY "System can manage transactions" ON transactions
  FOR ALL USING (true);

-- 11. Créer des wallets pour les utilisateurs existants
INSERT INTO wallets (user_id, balance, total_earned, total_spent)
SELECT id, 100, 100, 0
FROM public.users
WHERE id NOT IN (SELECT user_id FROM wallets);

-- 12. Message de confirmation
SELECT 'Système de wallet corrigé et créé avec succès!' as message;
