-- Script ultra-simplifié pour créer le bucket images
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer le bucket images (si il n'existe pas)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images', 
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Politiques RLS pour le bucket images
-- Politique d'upload
CREATE POLICY "images_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images');

-- Politique de lecture
CREATE POLICY "images_select_policy" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'images');

-- Politique de modification
CREATE POLICY "images_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique de suppression
CREATE POLICY "images_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
