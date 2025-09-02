-- Script pour ajouter la colonne last_activity à la table tasks
-- Exécutez ce script si vous souhaitez utiliser cette colonne

-- 1. Ajouter la colonne last_activity
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Mettre à jour les enregistrements existants
UPDATE tasks 
SET last_activity = updated_at 
WHERE last_activity IS NULL;

-- 3. Créer un trigger pour mettre à jour automatiquement last_activity
CREATE OR REPLACE FUNCTION update_task_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_task_last_activity ON tasks;
CREATE TRIGGER trigger_update_task_last_activity
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_last_activity();

-- 5. Vérifier que la colonne a été ajoutée
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name = 'last_activity'
  AND table_schema = 'public';

-- 6. Test de la colonne
SELECT 
  'COLONNE AJOUTEE' as status,
  'last_activity est maintenant disponible' as message;
