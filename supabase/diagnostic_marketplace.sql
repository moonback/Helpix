-- Script de diagnostic pour le marketplace
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de la table items
SELECT 'Structure de la table items:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'items'
ORDER BY ordinal_position;

-- 2. Compter le nombre total d'objets
SELECT 'Nombre total d''objets:' as info;
SELECT COUNT(*) as total_items FROM items;

-- 3. Vérifier les objets par statut is_rentable
SELECT 'Objets par statut is_rentable:' as info;
SELECT 
  is_rentable,
  COUNT(*) as count
FROM items 
GROUP BY is_rentable;

-- 4. Vérifier les objets par statut available
SELECT 'Objets par statut available:' as info;
SELECT 
  available,
  COUNT(*) as count
FROM items 
GROUP BY available;

-- 5. Vérifier les objets par catégorie
SELECT 'Objets par catégorie:' as info;
SELECT 
  category,
  COUNT(*) as count
FROM items 
GROUP BY category
ORDER BY count DESC;

-- 6. Afficher quelques exemples d'objets
SELECT 'Exemples d''objets (5 premiers):' as info;
SELECT 
  id,
  name,
  category,
  is_rentable,
  available,
  daily_price,
  created_at
FROM items 
ORDER BY created_at DESC
LIMIT 5;

-- 7. Vérifier s'il y a des objets avec is_rentable = false
SELECT 'Objets non louables:' as info;
SELECT 
  id,
  name,
  category,
  is_rentable,
  available
FROM items 
WHERE is_rentable = false OR is_rentable IS NULL;

-- 8. Vérifier les objets qui devraient être visibles
SELECT 'Objets qui devraient être visibles (is_rentable = true):' as info;
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

-- 9. Vérifier les contraintes et index
SELECT 'Contraintes sur la table items:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.items'::regclass;

-- 10. Vérifier les politiques RLS
SELECT 'Politiques RLS sur la table items:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'items';
