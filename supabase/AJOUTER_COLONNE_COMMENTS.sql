-- Script pour ajouter la colonne comments à la table tasks
-- Exécutez ce script pour corriger l'erreur PGRST204

-- 1. Ajouter la colonne comments
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;

-- 2. Vérifier que la colonne a été ajoutée
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name = 'comments'
  AND table_schema = 'public';

-- 3. Test de la colonne
SELECT 
  'COLONNE COMMENTS AJOUTEE' as status,
  'Les commentaires sont maintenant disponibles' as message;
