-- Script robuste pour corriger le marketplace
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. DIAGNOSTIC INITIAL
SELECT '=== DIAGNOSTIC INITIAL ===' as info;

SELECT 'Nombre total d''objets:' as info;
SELECT COUNT(*) as total_items FROM items;

SELECT 'Politiques RLS actuelles:' as info;
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'items';

-- 2. SUPPRESSION COMPLÈTE DES POLITIQUES
SELECT '=== SUPPRESSION DES POLITIQUES ===' as info;

-- Supprimer toutes les politiques existantes (même celles qu'on ne connaît pas)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'items'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON items', policy_record.policyname);
    END LOOP;
END $$;

-- 3. CRÉATION DES NOUVELLES POLITIQUES
SELECT '=== CRÉATION DES NOUVELLES POLITIQUES ===' as info;

-- Politique pour permettre à tous de voir tous les objets
CREATE POLICY "items_select_all" ON items
  FOR SELECT USING (true);

-- Politique pour permettre l'insertion de ses propres objets
CREATE POLICY "items_insert_own" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre la mise à jour de ses propres objets
CREATE POLICY "items_update_own" ON items
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre la suppression de ses propres objets
CREATE POLICY "items_delete_own" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- 4. CORRECTION DES OBJETS
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

-- 5. AJOUT D'OBJETS DE TEST (si nécessaire)
SELECT '=== AJOUT D''OBJETS DE TEST ===' as info;

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

-- 6. VÉRIFICATION FINALE
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

-- 7. MESSAGE DE CONFIRMATION
SELECT '=== CORRECTION TERMINÉE ===' as message;
SELECT 'Le marketplace devrait maintenant afficher tous les objets!' as message;
