-- Script pour créer la structure du système de Wallet
-- Exécutez ce script dans votre base de données Supabase

-- 1. Table des wallets
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_earned DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'withdrawal', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('task_completion', 'help_offer', 'withdrawal', 'bonus', 'refund')),
  reference_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- 3. Table des gains de crédits
CREATE TABLE IF NOT EXISTS credit_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  help_offer_id UUID REFERENCES help_offers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  task_title TEXT NOT NULL,
  task_owner TEXT NOT NULL
);

-- 4. Table des demandes de retrait
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('bank_transfer', 'paypal', 'crypto')),
  account_details JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- 5. Table des méthodes de paiement
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('bank_transfer', 'paypal', 'crypto')),
  is_default BOOLEAN DEFAULT FALSE,
  details JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);

-- 6. Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_earnings_user_id ON credit_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_earnings_status ON credit_earnings(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- 7. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger pour wallets
CREATE TRIGGER update_wallets_updated_at 
  BEFORE UPDATE ON wallets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Fonction pour créer automatiquement un wallet
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Trigger pour créer un wallet à l'inscription
CREATE TRIGGER create_wallet_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- 11. Fonction pour traiter les gains de crédits
CREATE OR REPLACE FUNCTION process_credit_earning(earning_id UUID)
RETURNS VOID AS $$
DECLARE
  earning_record credit_earnings%ROWTYPE;
  user_wallet wallets%ROWTYPE;
BEGIN
  -- Récupérer le gain
  SELECT * INTO earning_record FROM credit_earnings WHERE id = earning_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gain non trouvé';
  END IF;
  
  IF earning_record.status != 'approved' THEN
    RAISE EXCEPTION 'Le gain doit être approuvé avant d''être traité';
  END IF;
  
  -- Récupérer le wallet de l'utilisateur
  SELECT * INTO user_wallet FROM wallets WHERE user_id = earning_record.user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet non trouvé';
  END IF;
  
  -- Mettre à jour le gain
  UPDATE credit_earnings 
  SET status = 'paid', paid_at = NOW()
  WHERE id = earning_id;
  
  -- Mettre à jour le wallet
  UPDATE wallets 
  SET 
    balance = balance + earning_record.amount,
    total_earned = total_earned + earning_record.amount,
    updated_at = NOW()
  WHERE user_id = earning_record.user_id;
  
  -- Créer une transaction
  INSERT INTO transactions (
    wallet_id, type, amount, description, 
    reference_type, reference_id, status, metadata
  ) VALUES (
    user_wallet.id, 'credit', earning_record.amount,
    'Gain pour l''aide apportée à la tâche: ' || earning_record.task_title,
    'help_offer', earning_record.help_offer_id, 'completed',
    jsonb_build_object(
      'task_title', earning_record.task_title,
      'task_id', earning_record.task_id,
      'help_offer_id', earning_record.help_offer_id
    )
  );
END;
$$ language 'plpgsql';

-- 12. Fonction pour traiter les demandes de retrait
CREATE OR REPLACE FUNCTION process_withdrawal_request(request_id UUID, new_status VARCHAR(20))
RETURNS VOID AS $$
DECLARE
  request_record withdrawal_requests%ROWTYPE;
  user_wallet wallets%ROWTYPE;
BEGIN
  -- Récupérer la demande
  SELECT * INTO request_record FROM withdrawal_requests WHERE id = request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande de retrait non trouvée';
  END IF;
  
  IF request_record.status != 'pending' THEN
    RAISE EXCEPTION 'La demande a déjà été traitée';
  END IF;
  
  -- Récupérer le wallet de l'utilisateur
  SELECT * INTO user_wallet FROM wallets WHERE user_id = request_record.user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet non trouvé';
  END IF;
  
  -- Vérifier le solde
  IF user_wallet.balance < request_record.amount THEN
    RAISE EXCEPTION 'Solde insuffisant';
  END IF;
  
  -- Mettre à jour la demande
  UPDATE withdrawal_requests 
  SET 
    status = new_status,
    processed_at = CASE WHEN new_status IN ('completed', 'rejected') THEN NOW() ELSE NULL END
  WHERE id = request_id;
  
  -- Si approuvée, déduire du wallet et créer une transaction
  IF new_status = 'completed' THEN
    UPDATE wallets 
    SET 
      balance = balance - request_record.amount,
      total_spent = total_spent + request_record.amount,
      updated_at = NOW()
    WHERE user_id = request_record.user_id;
    
    INSERT INTO transactions (
      wallet_id, type, amount, description, 
      reference_type, reference_id, status, metadata
    ) VALUES (
      user_wallet.id, 'withdrawal', request_record.amount,
      'Retrait vers ' || request_record.payment_method,
      'withdrawal', request_id, 'completed',
      jsonb_build_object(
        'payment_method', request_record.payment_method,
        'account_details', request_record.account_details
      )
    );
  END IF;
END;
$$ language 'plpgsql';

-- 13. RLS (Row Level Security) Policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policies pour wallets
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

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

-- 14. Vue pour les statistiques du wallet
CREATE OR REPLACE VIEW wallet_stats AS
SELECT 
  w.user_id,
  w.balance as total_balance,
  COALESCE(monthly_earnings.amount, 0) as monthly_earnings,
  COALESCE(pending_earnings.amount, 0) as pending_earnings,
  COUNT(t.id) as total_transactions,
  COALESCE(AVG(CASE WHEN t.type = 'credit' THEN t.amount END), 0) as average_earning_per_task
FROM wallets w
LEFT JOIN transactions t ON w.id = t.wallet_id
LEFT JOIN (
  SELECT w.user_id, SUM(t.amount) as amount
  FROM wallets w
  JOIN transactions t ON w.id = t.wallet_id
  WHERE t.type = 'credit' 
    AND t.created_at >= date_trunc('month', CURRENT_DATE)
  GROUP BY w.user_id
) monthly_earnings ON w.user_id = monthly_earnings.user_id
LEFT JOIN (
  SELECT user_id, SUM(amount) as amount
  FROM credit_earnings 
  WHERE status = 'pending'
  GROUP BY user_id
) pending_earnings ON w.user_id = pending_earnings.user_id
GROUP BY w.user_id, w.balance, monthly_earnings.amount, pending_earnings.amount;

-- 15. Données de test (optionnel)
-- INSERT INTO credit_earnings (user_id, task_id, help_offer_id, amount, task_title, task_owner, status)
-- VALUES (
--   'your-user-id',
--   1,
--   'your-help-offer-id',
--   50.00,
--   'Tâche de test',
--   'Propriétaire de test',
--   'approved'
-- );

-- Message de confirmation
SELECT 'Structure du Wallet créée avec succès!' as message;
