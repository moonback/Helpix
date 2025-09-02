-- =====================================================
-- Script de nettoyage des politiques RLS pour les crédits
-- =====================================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "credit_packages_read" ON credit_packages;
DROP POLICY IF EXISTS "credit_purchases_user_access" ON credit_purchases;

-- Désactiver temporairement RLS si nécessaire
-- ALTER TABLE credit_packages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE credit_purchases DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- Fin du script de nettoyage
-- =====================================================
