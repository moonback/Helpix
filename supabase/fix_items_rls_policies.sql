-- Script pour corriger les politiques RLS de la table items
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "items_select_rentable" ON items;
DROP POLICY IF EXISTS "items_select_own" ON items;
DROP POLICY IF EXISTS "items_select_all" ON items;
DROP POLICY IF EXISTS "items_insert_own" ON items;
DROP POLICY IF EXISTS "items_update_own" ON items;
DROP POLICY IF EXISTS "items_delete_own" ON items;

-- 2. Créer de nouvelles politiques plus permissives
-- Politique pour permettre à tous de voir tous les objets (pour le marketplace public)
CREATE POLICY "items_select_all" ON items
  FOR SELECT USING (true);

-- Politique pour permettre aux utilisateurs de voir leurs propres objets
CREATE POLICY "items_select_own" ON items
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion de ses propres objets
CREATE POLICY "items_insert_own" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre la mise à jour de ses propres objets
CREATE POLICY "items_update_own" ON items
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre la suppression de ses propres objets
CREATE POLICY "items_delete_own" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Vérifier les nouvelles politiques
SELECT 'Nouvelles politiques RLS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'items'
ORDER BY policyname;

-- 4. Tester l'accès aux objets
SELECT 'Test d''accès aux objets:' as info;
SELECT COUNT(*) as total_visible_items FROM items;

-- 5. Afficher quelques exemples d'objets visibles
SELECT 'Exemples d''objets visibles:' as info;
SELECT 
  id,
  name,
  category,
  is_rentable,
  available,
  daily_price
FROM items 
ORDER BY created_at DESC
LIMIT 5;

-- 6. Message de confirmation
SELECT 'Politiques RLS corrigées! Tous les objets devraient maintenant être visibles.' as message;
