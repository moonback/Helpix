-- Script simple pour corriger les clés étrangères manquantes
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Vérifier les valeurs disponibles dans l'enum rental_status_enum
SELECT unnest(enum_range(NULL::rental_status_enum)) as status_values;

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

-- Ajouter les politiques RLS pour la table rentals
DO $$
BEGIN
  -- Politique pour permettre aux utilisateurs de voir leurs propres locations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rentals' AND policyname = 'rentals_select_own'
  ) THEN
    CREATE POLICY "rentals_select_own" ON public.rentals
      FOR SELECT USING (
        auth.uid() = owner_id OR auth.uid() = renter_id
      );
  END IF;

  -- Politique pour permettre aux utilisateurs de créer des locations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rentals' AND policyname = 'rentals_insert_own'
  ) THEN
    CREATE POLICY "rentals_insert_own" ON public.rentals
      FOR INSERT WITH CHECK (
        auth.uid() = renter_id
      );
  END IF;

  -- Politique pour permettre aux propriétaires de mettre à jour leurs locations
  -- Seul le propriétaire peut accepter/refuser une demande de location
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rentals' AND policyname = 'rentals_update_own'
  ) THEN
    CREATE POLICY "rentals_update_own" ON public.rentals
      FOR UPDATE USING (
        auth.uid() = owner_id
      );
  END IF;

  -- Politique pour permettre aux propriétaires de supprimer leurs locations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rentals' AND policyname = 'rentals_delete_own'
  ) THEN
    CREATE POLICY "rentals_delete_own" ON public.rentals
      FOR DELETE USING (
        auth.uid() = owner_id
      );
  END IF;

  -- Politique spécifique pour les changements de statut (acceptation/refus)
  -- Seul le propriétaire peut changer le statut d'une location
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rentals' AND policyname = 'rentals_status_update_owner'
  ) THEN
    CREATE POLICY "rentals_status_update_owner" ON public.rentals
      FOR UPDATE USING (
        auth.uid() = owner_id
      );
  END IF;
END $$;

-- Activer RLS sur la table rental_reviews si pas déjà fait
ALTER TABLE public.rental_reviews ENABLE ROW LEVEL SECURITY;

-- Ajouter les politiques RLS pour la table rental_reviews
DO $$
BEGIN
  -- Politique pour permettre aux utilisateurs de voir les avis
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rental_reviews' AND policyname = 'rental_reviews_select_all'
  ) THEN
    CREATE POLICY "rental_reviews_select_all" ON public.rental_reviews
      FOR SELECT USING (true);
  END IF;

  -- Politique pour permettre aux utilisateurs de créer des avis
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rental_reviews' AND policyname = 'rental_reviews_insert_own'
  ) THEN
    CREATE POLICY "rental_reviews_insert_own" ON public.rental_reviews
      FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id
      );
  END IF;

  -- Politique pour permettre aux utilisateurs de mettre à jour leurs propres avis
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rental_reviews' AND policyname = 'rental_reviews_update_own'
  ) THEN
    CREATE POLICY "rental_reviews_update_own" ON public.rental_reviews
      FOR UPDATE USING (
        auth.uid() = reviewer_id
      );
  END IF;

  -- Politique pour permettre aux utilisateurs de supprimer leurs propres avis
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rental_reviews' AND policyname = 'rental_reviews_delete_own'
  ) THEN
    CREATE POLICY "rental_reviews_delete_own" ON public.rental_reviews
      FOR DELETE USING (
        auth.uid() = reviewer_id
      );
  END IF;
END $$;
