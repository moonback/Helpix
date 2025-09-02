-- Script pour corriger les objets du marketplace
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Mettre à jour tous les objets pour qu'ils soient louables par défaut
UPDATE items 
SET is_rentable = true 
WHERE is_rentable IS NULL OR is_rentable = false;

-- 2. Vérifier le résultat
SELECT 'Objets mis à jour:' as info;
SELECT 
  is_rentable,
  COUNT(*) as count
FROM items 
GROUP BY is_rentable;

-- 3. S'assurer que tous les objets ont des valeurs par défaut correctes
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

-- 4. Vérifier que tous les objets sont maintenant visibles
SELECT 'Objets maintenant visibles:' as info;
SELECT 
  id,
  name,
  category,
  is_rentable,
  available,
  daily_price
FROM items 
WHERE is_rentable = true
ORDER BY created_at DESC;

-- 5. Compter les objets par catégorie après correction
SELECT 'Objets par catégorie après correction:' as info;
SELECT 
  category,
  COUNT(*) as count
FROM items 
WHERE is_rentable = true
GROUP BY category
ORDER BY count DESC;

-- 6. Message de confirmation
SELECT 'Correction terminée! Tous les objets devraient maintenant être visibles.' as message;
