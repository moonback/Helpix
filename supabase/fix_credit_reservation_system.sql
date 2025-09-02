-- Script pour corriger le système de réservation de crédits
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. DIAGNOSTIC - Vérifier l'état actuel
SELECT '=== DIAGNOSTIC DU SYSTÈME DE RÉSERVATION ===' as info;

-- Vérifier les crédits réservés
SELECT 
  'Crédits réservés par utilisateur:' as info,
  u.email,
  w.balance,
  w.reserved_credits,
  (w.balance - w.reserved_credits) as available_balance
FROM wallets w
JOIN users u ON u.id = w.user_id
WHERE w.reserved_credits > 0
ORDER BY w.reserved_credits DESC;

-- 2. CORRIGER LES CRÉDITS RÉSERVÉS
SELECT '=== CORRECTION DES CRÉDITS RÉSERVÉS ===' as info;

-- Mettre à zéro les crédits réservés (ils seront recalculés correctement)
UPDATE wallets 
SET reserved_credits = 0
WHERE reserved_credits > 0;

-- 3. VÉRIFICATION FINALE
SELECT '=== VÉRIFICATION FINALE ===' as info;

-- Vérifier que les crédits réservés sont à zéro
SELECT 
  'Crédits réservés après correction:' as info,
  COUNT(*) as users_with_reserved_credits
FROM wallets 
WHERE reserved_credits > 0;

-- Afficher les soldes disponibles
SELECT 
  'Soldes disponibles par utilisateur:' as info,
  u.email,
  w.balance,
  w.reserved_credits,
  (w.balance - w.reserved_credits) as available_balance
FROM wallets w
JOIN users u ON u.id = w.user_id
ORDER BY w.balance DESC;

-- 4. MESSAGE DE CONFIRMATION
SELECT '=== CORRECTION TERMINÉE ===' as message;
SELECT 'Le système de réservation de crédits a été corrigé!' as message;
