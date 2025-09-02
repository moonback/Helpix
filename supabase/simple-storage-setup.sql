-- =====================================================
-- Configuration simplifiée du Storage Supabase pour Helpix
-- Sans modification des paramètres de base de données
-- =====================================================
-- 
-- Ce script crée les buckets, politiques RLS et fonctions
-- adaptées à votre schéma de base de données
--
-- IMPORTANT: Remplacez 'YOUR_PROJECT_REF' par votre référence de projet
-- Exemple: wdzdfdqmzvgirgakafqe
--
-- =====================================================

-- =====================================================
-- 1. CRÉATION DES BUCKETS
-- =====================================================

-- Bucket pour les images d'objets et tâches
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les avatars utilisateurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. POLITIQUES RLS POUR LE BUCKET 'images'
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "images_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "images_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "images_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "images_delete_policy" ON storage.objects;

-- Créer les nouvelles politiques
CREATE POLICY "images_upload_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

CREATE POLICY "images_select_policy"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'images');

CREATE POLICY "images_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "images_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 3. POLITIQUES RLS POUR LE BUCKET 'avatars'
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "avatars_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_policy" ON storage.objects;

-- Créer les nouvelles politiques
CREATE POLICY "avatars_upload_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "avatars_select_policy"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "avatars_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 4. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour nettoyer les fichiers orphelins
CREATE OR REPLACE FUNCTION storage.cleanup_orphaned_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Nettoyer les images d'objets orphelines (table items)
  DELETE FROM storage.objects 
  WHERE bucket_id = 'images' 
  AND created_at < NOW() - INTERVAL '1 hour'
  AND NOT EXISTS (
    SELECT 1 FROM public.items 
    WHERE items.images::text LIKE '%' || storage.objects.name || '%'
  );
  
  -- Nettoyer les images de tâches orphelines (table tasks)
  DELETE FROM storage.objects 
  WHERE bucket_id = 'images' 
  AND created_at < NOW() - INTERVAL '1 hour'
  AND NOT EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.images::text LIKE '%' || storage.objects.name || '%'
  );
  
  -- Nettoyer les avatars orphelins (table users)
  DELETE FROM storage.objects 
  WHERE bucket_id = 'avatars' 
  AND created_at < NOW() - INTERVAL '1 hour'
  AND NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.avatar_url LIKE '%' || storage.objects.name || '%'
  );
END;
$$;

-- Fonction pour obtenir l'URL publique d'un fichier
CREATE OR REPLACE FUNCTION storage.get_public_url(bucket_name text, file_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_public boolean;
  base_url text;
BEGIN
  -- Récupérer si le bucket est public
  SELECT public INTO bucket_public
  FROM storage.buckets
  WHERE id = bucket_name;
  
  -- Construire l'URL publique
  IF bucket_public THEN
    -- Utiliser l'URL par défaut de Supabase
    base_url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co/storage/v1/object/public';
    IF base_url IS NULL OR base_url = 'https://.supabase.co/storage/v1/object/public' THEN
      -- Fallback: utiliser l'URL de votre projet
      base_url := 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public';
    END IF;
    RETURN base_url || '/' || bucket_name || '/' || file_path;
  END IF;
  
  RETURN NULL;
END;
$$;

-- =====================================================
-- 5. TRIGGERS POUR LE NETTOYAGE AUTOMATIQUE
-- =====================================================

-- Trigger pour nettoyer les images lors de la suppression d'un item
CREATE OR REPLACE FUNCTION storage.cleanup_item_images()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  image_paths text[];
  path text;
BEGIN
  -- Extraire les chemins des images de l'ancien item
  IF OLD.images IS NOT NULL AND array_length(OLD.images, 1) > 0 THEN
    -- Supprimer chaque image du storage
    FOREACH path IN ARRAY OLD.images
    LOOP
      -- Extraire le nom du fichier de l'URL
      path := substring(path from 'images/(.+)$');
      IF path IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'images' 
        AND name = path;
      END IF;
    END LOOP;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Créer le trigger pour les items
DROP TRIGGER IF EXISTS cleanup_item_images_trigger ON public.items;
CREATE TRIGGER cleanup_item_images_trigger
  BEFORE DELETE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION storage.cleanup_item_images();

-- Trigger pour nettoyer les images lors de la suppression d'une tâche
CREATE OR REPLACE FUNCTION storage.cleanup_task_images()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  image_paths text[];
  path text;
BEGIN
  -- Extraire les chemins des images de l'ancienne tâche
  IF OLD.images IS NOT NULL AND array_length(OLD.images, 1) > 0 THEN
    -- Supprimer chaque image du storage
    FOREACH path IN ARRAY OLD.images
    LOOP
      -- Extraire le nom du fichier de l'URL
      path := substring(path from 'images/(.+)$');
      IF path IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'images' 
        AND name = path;
      END IF;
    END LOOP;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Créer le trigger pour les tâches
DROP TRIGGER IF EXISTS cleanup_task_images_trigger ON public.tasks;
CREATE TRIGGER cleanup_task_images_trigger
  BEFORE DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION storage.cleanup_task_images();

-- =====================================================
-- 6. INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name ON storage.objects(bucket_id, name);
CREATE INDEX IF NOT EXISTS idx_storage_objects_owner ON storage.objects(owner);
CREATE INDEX IF NOT EXISTS idx_storage_objects_created_at ON storage.objects(created_at);

-- =====================================================
-- 7. VÉRIFICATION DE LA CONFIGURATION
-- =====================================================

-- Vérifier que les buckets ont été créés
SELECT 
  'Buckets créés:' as info,
  id as bucket_id,
  name as bucket_name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('images', 'avatars')
ORDER BY id;

-- Vérifier que les politiques ont été créées
SELECT 
  'Politiques RLS créées:' as info,
  policyname,
  cmd as operation,
  qual as condition
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- Vérifier que les triggers ont été créés
SELECT 
  'Triggers créés:' as info,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%cleanup%'
ORDER BY trigger_name;

-- Test de connexion au storage
SELECT 
  'Test de connexion:' as info,
  'Storage accessible' as status,
  COUNT(*) as bucket_count
FROM storage.buckets;

-- =====================================================
-- 8. MESSAGES DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Configuration du storage Supabase terminée avec succès!';
  RAISE NOTICE '📁 Buckets créés: images, avatars';
  RAISE NOTICE '🔒 Politiques RLS configurées pour votre schéma de BDD';
  RAISE NOTICE '🧹 Fonctions de nettoyage installées';
  RAISE NOTICE '⚡ Triggers de nettoyage automatique activés';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Prochaines étapes:';
  RAISE NOTICE '1. Remplacer YOUR_PROJECT_REF par votre référence de projet dans la fonction get_public_url';
  RAISE NOTICE '2. Tester les uploads d''images dans l''application';
  RAISE NOTICE '3. Vérifier que les images s''affichent correctement';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Pour nettoyer les fichiers orphelins:';
  RAISE NOTICE 'SELECT storage.cleanup_orphaned_files();';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables supportées:';
  RAISE NOTICE '- public.items (images d''objets)';
  RAISE NOTICE '- public.tasks (images de tâches)';
  RAISE NOTICE '- public.users (avatars)';
END $$;

-- =====================================================
-- 9. EXEMPLES D'UTILISATION
-- =====================================================

/*
EXEMPLES D'UTILISATION AVEC VOTRE SCHÉMA :

1. Upload d'une image d'objet :
   - L'image sera stockée dans le bucket 'images'
   - L'URL sera ajoutée au tableau 'images' de la table 'items'
   - Structure: items/{user_id}/{filename}

2. Upload d'une image de tâche :
   - L'image sera stockée dans le bucket 'images'
   - L'URL sera ajoutée au tableau 'images' de la table 'tasks'
   - Structure: items/{user_id}/{filename}

3. Upload d'un avatar :
   - L'image sera stockée dans le bucket 'avatars'
   - L'URL sera mise à jour dans la colonne 'avatar_url' de la table 'users'
   - Structure: avatars/{user_id}/{filename}

4. Nettoyage automatique :
   - Lors de la suppression d'un item, ses images sont automatiquement supprimées
   - Lors de la suppression d'une tâche, ses images sont automatiquement supprimées
   - Les fichiers orphelins peuvent être nettoyés manuellement

5. Sécurité :
   - Seuls les utilisateurs authentifiés peuvent uploader
   - Chaque utilisateur ne peut modifier/supprimer que ses propres fichiers
   - Les images sont publiquement accessibles en lecture

6. Configuration de l'URL :
   - Remplacez 'YOUR_PROJECT_REF' par votre référence de projet dans la fonction get_public_url
   - Exemple: wdzdfdqmzvgirgakafqe
*/