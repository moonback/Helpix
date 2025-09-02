-- Script simple pour corriger les clés étrangères manquantes
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Activer RLS sur la table rentals si pas déjà fait
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- Ajouter les clés étrangères manquantes
DO $$
BEGIN
  -- Ajouter la contrainte de clé étrangère pour owner_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rentals_owner_id_fkey'
  ) THEN
    ALTER TABLE public.rentals 
    ADD CONSTRAINT rentals_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Ajouter la contrainte de clé étrangère pour renter_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rentals_renter_id_fkey'
  ) THEN
    ALTER TABLE public.rentals 
    ADD CONSTRAINT rentals_renter_id_fkey 
    FOREIGN KEY (renter_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ajouter les clés étrangères manquantes pour rental_reviews
DO $$
BEGIN
  -- Ajouter la contrainte de clé étrangère pour reviewer_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rental_reviews_reviewer_id_fkey'
  ) THEN
    ALTER TABLE public.rental_reviews 
    ADD CONSTRAINT rental_reviews_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Ajouter la contrainte de clé étrangère pour reviewee_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rental_reviews_reviewee_id_fkey'
  ) THEN
    ALTER TABLE public.rental_reviews 
    ADD CONSTRAINT rental_reviews_reviewee_id_fkey 
    FOREIGN KEY (reviewee_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Vérifier que les contraintes ont été créées pour rentals
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conrelid = 'public.rentals'::regclass 
AND contype = 'f'
ORDER BY conname;

-- Vérifier que les contraintes ont été créées pour rental_reviews
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conrelid = 'public.rental_reviews'::regclass 
AND contype = 'f'
ORDER BY conname;
