-- Script pour corriger les transactions de caution en double
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. DIAGNOSTIC - Identifier les transactions en double
SELECT '=== DIAGNOSTIC DES TRANSACTIONS EN DOUBLE ===' as info;

-- Vérifier les transactions de caution
SELECT 
  'Transactions de caution par location:' as info,
  reference_id,
  COUNT(*) as count,
  STRING_AGG(description, ' | ') as descriptions
FROM transactions 
WHERE reference_type IN ('rental_deposit', 'escrow_deposit', 'escrow_release')
GROUP BY reference_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. IDENTIFIER LES TRANSACTIONS À SUPPRIMER
SELECT '=== IDENTIFICATION DES TRANSACTIONS À SUPPRIMER ===' as info;

-- Trouver les transactions de réservation de caution (à supprimer)
SELECT 
  'Transactions de réservation de caution à supprimer:' as info,
  id,
  reference_id,
  description,
  amount,
  created_at
FROM transactions 
WHERE reference_type = 'rental_deposit'
  AND description LIKE '%Caution bloquée%'
ORDER BY created_at DESC;

-- 3. SUPPRIMER LES TRANSACTIONS EN DOUBLE
SELECT '=== SUPPRESSION DES TRANSACTIONS EN DOUBLE ===' as info;

-- Supprimer les transactions de réservation de caution (garder seulement les escrow)
DELETE FROM transactions 
WHERE reference_type = 'rental_deposit'
  AND description LIKE '%Caution bloquée%';

-- 4. VÉRIFICATION FINALE
SELECT '=== VÉRIFICATION FINALE ===' as info;

-- Vérifier qu'il n'y a plus de doublons
SELECT 
  'Transactions de caution après nettoyage:' as info,
  reference_id,
  COUNT(*) as count,
  STRING_AGG(description, ' | ') as descriptions
FROM transactions 
WHERE reference_type IN ('rental_deposit', 'escrow_deposit', 'escrow_release')
GROUP BY reference_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Afficher les transactions restantes
SELECT 
  'Transactions de caution restantes:' as info,
  id,
  reference_id,
  type,
  reference_type,
  description,
  amount,
  created_at
FROM transactions 
WHERE reference_type IN ('escrow_deposit', 'escrow_release')
ORDER BY reference_id, created_at;

-- 5. MESSAGE DE CONFIRMATION
SELECT '=== NETTOYAGE TERMINÉ ===' as message;
SELECT 'Les transactions de caution en double ont été supprimées!' as message;
