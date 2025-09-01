-- Script de correction des erreurs 400
-- Executez ce script APRES avoir execute le diagnostic

-- 1. Corriger les politiques RLS sur users (si RLS est actif)
DO $$ 
BEGIN
  -- Verifier si RLS est actif sur users
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true) THEN
    
    -- Supprimer les anciennes politiques si elles existent
    DROP POLICY IF EXISTS "Users can update their own profile" ON users;
    DROP POLICY IF EXISTS "Users can view their own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
    
    -- Creer une politique pour permettre aux utilisateurs de voir leur profil
    CREATE POLICY "Users can view their own profile" ON users
      FOR SELECT USING (id = auth.uid());
    
    -- Creer une politique pour permettre aux utilisateurs de mettre a jour leur profil
    CREATE POLICY "Users can update their own profile" ON users
      FOR UPDATE USING (id = auth.uid());
    
    -- Creer une politique pour permettre aux utilisateurs d'inserer leur profil
    CREATE POLICY "Users can insert their own profile" ON users
      FOR INSERT WITH CHECK (id = auth.uid());
      
  END IF;
END $$;

-- 2. Corriger les politiques RLS sur conversations
-- Supprimer et recreer la politique d'insertion pour etre plus permissive
DROP POLICY IF EXISTS conversations_insert_policy ON conversations;

CREATE POLICY conversations_insert_policy ON conversations
  FOR INSERT WITH CHECK (true);

-- 3. Verifier que toutes les colonnes obligatoires ont des valeurs par defaut
-- Ajouter des valeurs par defaut si necessaire
DO $$ 
BEGIN
  -- S'assurer que created_at a une valeur par defaut
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'conversations' 
                 AND column_name = 'created_at' 
                 AND column_default IS NOT NULL) THEN
    ALTER TABLE conversations ALTER COLUMN created_at SET DEFAULT NOW();
  END IF;
  
  -- S'assurer que updated_at a une valeur par defaut
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'conversations' 
                 AND column_name = 'updated_at' 
                 AND column_default IS NOT NULL) THEN
    ALTER TABLE conversations ALTER COLUMN updated_at SET DEFAULT NOW();
  END IF;
END $$;

-- 4. Tester la creation d'une conversation
-- (Executez cette ligne pour verifier que ca fonctionne maintenant)
INSERT INTO conversations DEFAULT VALUES RETURNING *;

-- 5. Verifier les politiques finales
SELECT 
  'POLITIQUES RLS FINALES' as info,
  'Verification des politiques creees' as detail;

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('users', 'conversations')
ORDER BY tablename, policyname;

-- 6. Message de confirmation
SELECT 
  'CORRECTION TERMINEE' as status,
  'Testez maintenant le bouton Contacter' as instruction;
