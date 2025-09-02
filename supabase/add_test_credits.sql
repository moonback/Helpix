-- Script pour ajouter des crédits de test aux utilisateurs existants
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Mettre à jour tous les wallets existants avec 500 crédits pour les tests
UPDATE wallets 
SET 
  balance = 500,
  total_earned = 500,
  updated_at = NOW()
WHERE balance < 500;

-- 2. Créer des wallets pour les utilisateurs qui n'en ont pas encore
INSERT INTO wallets (user_id, balance, total_earned, total_spent)
SELECT id, 500, 500, 0
FROM public.users
WHERE id NOT IN (SELECT user_id FROM wallets);

-- 3. Afficher un résumé des wallets
SELECT 
  u.name as nom_utilisateur,
  w.balance as solde_actuel,
  w.total_earned as total_gagne,
  w.total_spent as total_depense
FROM wallets w
JOIN public.users u ON w.user_id = u.id
ORDER BY w.balance DESC;

-- 4. Message de confirmation
SELECT 'Crédits de test ajoutés avec succès! Tous les utilisateurs ont maintenant 500 crédits.' as message;
