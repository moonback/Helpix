-- Script pour créer un wallet pour l'utilisateur actuel
-- Exécutez ce script après vous être connecté dans Supabase

-- 1. Vérifier l'utilisateur actuel
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_user_email;

-- 2. Vérifier si l'utilisateur a déjà un wallet
SELECT 
  id,
  user_id,
  balance,
  total_earned,
  total_spent,
  created_at
FROM wallets 
WHERE user_id = auth.uid();

-- 3. Créer un wallet pour l'utilisateur actuel s'il n'en a pas
INSERT INTO wallets (user_id, balance, total_earned, total_spent)
SELECT auth.uid(), 0, 0, 0
WHERE auth.uid() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM wallets WHERE user_id = auth.uid()
  );

-- 4. Vérifier que le wallet a été créé
SELECT 
  id,
  user_id,
  balance,
  total_earned,
  total_spent,
  created_at
FROM wallets 
WHERE user_id = auth.uid();

-- 5. Tester l'accès aux transactions (devrait être vide au début)
SELECT 
  t.id,
  t.type,
  t.amount,
  t.description,
  t.created_at
FROM transactions t
JOIN wallets w ON t.wallet_id = w.id
WHERE w.user_id = auth.uid()
ORDER BY t.created_at DESC;

-- Message de confirmation
SELECT 'Wallet créé et testé avec succès!' as message;
