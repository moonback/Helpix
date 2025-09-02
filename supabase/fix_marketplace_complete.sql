-- Script complet pour corriger le marketplace
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. DIAGNOSTIC - Vérifier l'état actuel
SELECT '=== DIAGNOSTIC INITIAL ===' as info;

SELECT 'Nombre total d''objets:' as info;
SELECT COUNT(*) as total_items FROM items;

SELECT 'Objets par statut is_rentable:' as info;
SELECT 
  is_rentable,
  COUNT(*) as count
FROM items 
GROUP BY is_rentable;

SELECT 'Politiques RLS actuelles:' as info;
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'items';

-- 2. CORRECTION DES POLITIQUES RLS
SELECT '=== CORRECTION DES POLITIQUES RLS ===' as info;

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "items_select_rentable" ON items;
DROP POLICY IF EXISTS "items_select_own" ON items;
DROP POLICY IF EXISTS "items_select_all" ON items;
DROP POLICY IF EXISTS "items_insert_own" ON items;
DROP POLICY IF EXISTS "items_update_own" ON items;
DROP POLICY IF EXISTS "items_delete_own" ON items;

-- Créer de nouvelles politiques permissives
CREATE POLICY "items_select_all" ON items
  FOR SELECT USING (true);

CREATE POLICY "items_select_own" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "items_insert_own" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "items_update_own" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "items_delete_own" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- 3. CORRECTION DES OBJETS
SELECT '=== CORRECTION DES OBJETS ===' as info;

-- Mettre à jour tous les objets pour qu'ils soient louables
UPDATE items 
SET is_rentable = true 
WHERE is_rentable IS NULL OR is_rentable = false;

-- S'assurer que tous les objets ont des valeurs par défaut correctes
UPDATE items 
SET 
  available = COALESCE(available, true),
  daily_price = COALESCE(daily_price, 0),
  deposit = COALESCE(deposit, 0),
  tags = COALESCE(tags, '{}'),
  images = COALESCE(images, '{}')
WHERE 
  available IS NULL OR 
  daily_price IS NULL OR 
  deposit IS NULL OR 
  tags IS NULL OR 
  images IS NULL;

-- 4. AJOUT D'OBJETS DE TEST (si nécessaire)
SELECT '=== AJOUT D''OBJETS DE TEST ===' as info;

-- Vérifier s'il y a des objets
SELECT COUNT(*) as count FROM items;

-- Ajouter des objets de test si la table est vide
INSERT INTO items (
  user_id,
  name,
  description,
  category,
  condition,
  daily_price,
  deposit,
  is_rentable,
  available,
  tags,
  images,
  location,
  latitude,
  longitude
) 
SELECT 
  (SELECT id FROM users LIMIT 1),
  'Perceuse Bosch Professional',
  'Perceuse visseuse sans fil 18V, idéale pour tous vos travaux de bricolage.',
  'tools',
  'excellent',
  15.00,
  50.00,
  true,
  true,
  ARRAY['bricolage', 'perceuse', 'sans-fil'],
  ARRAY['https://example.com/perceuse1.jpg'],
  'Paris, France',
  48.8566,
  2.3522
WHERE NOT EXISTS (SELECT 1 FROM items LIMIT 1);

-- 5. VÉRIFICATION FINALE
SELECT '=== VÉRIFICATION FINALE ===' as info;

SELECT 'Nouvelles politiques RLS:' as info;
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'items'
ORDER BY policyname;

SELECT 'Objets maintenant visibles:' as info;
SELECT COUNT(*) as total_visible_items FROM items;

SELECT 'Objets par catégorie:' as info;
SELECT 
  category,
  COUNT(*) as count
FROM items 
GROUP BY category
ORDER BY count DESC;

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

-- 6. MESSAGE DE CONFIRMATION
SELECT '=== CORRECTION TERMINÉE ===' as message;
SELECT 'Le marketplace devrait maintenant afficher tous les objets!' as message;
