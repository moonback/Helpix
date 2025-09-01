-- Script pour corriger les politiques RLS du système Wallet
-- Ce script ajoute les politiques manquantes pour permettre la création de wallets

-- 1. Supprimer les politiques existantes pour les recréer
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can update their own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can insert their own wallet" ON wallets;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view their own earnings" ON credit_earnings;
DROP POLICY IF EXISTS "Users can insert their own earnings" ON credit_earnings;

DROP POLICY IF EXISTS "Users can view their own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Users can insert their own withdrawal requests" ON withdrawal_requests;

DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON payment_methods;

-- 2. Recréer les politiques avec les bonnes permissions

-- Policies pour wallets
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies pour transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM wallets WHERE id = wallet_id));

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM wallets WHERE id = wallet_id));

-- Policies pour credit_earnings
CREATE POLICY "Users can view their own earnings" ON credit_earnings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own earnings" ON credit_earnings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies pour withdrawal_requests
CREATE POLICY "Users can view their own withdrawal requests" ON withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawal requests" ON withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies pour payment_methods
CREATE POLICY "Users can view their own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Vérifier que RLS est activé sur toutes les tables
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- 4. Créer un wallet pour l'utilisateur actuel s'il n'en a pas
-- Note: Cette requête ne fonctionnera que si vous êtes connecté
-- INSERT INTO wallets (user_id, balance, total_earned, total_spent)
-- SELECT auth.uid(), 0, 0, 0
-- WHERE auth.uid() IS NOT NULL
--   AND NOT EXISTS (
--     SELECT 1 FROM wallets WHERE user_id = auth.uid()
--   );

-- Message de confirmation
SELECT 'Politiques RLS du Wallet corrigées avec succès!' as message;
