-- Script complet pour activer le système de crédit automatique
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier et créer la fonction de crédit automatique
CREATE OR REPLACE FUNCTION public.credit_assigned_user_on_task_completion()
RETURNS TRIGGER AS $$
DECLARE
    assigned_user_wallet_id uuid;
    task_budget numeric;
    task_title text;
    existing_credit_count integer;
BEGIN
    -- Vérifier si le statut est passé à 'completed'
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN
        -- Vérifier que la tâche a un utilisateur assigné et un budget de crédits
        IF NEW.assigned_to IS NOT NULL AND NEW.budget_credits > 0 THEN
            -- Vérifier si l'utilisateur a déjà été crédité pour cette tâche
            SELECT COUNT(*) INTO existing_credit_count
            FROM public.transactions
            WHERE reference_type = 'task_completion'
              AND reference_id = NEW.id::text
              AND type = 'credit'
              AND status = 'completed';
            
            -- Si l'utilisateur n'a pas encore été crédité
            IF existing_credit_count = 0 THEN
                -- Récupérer l'ID du wallet de l'utilisateur assigné
                SELECT id INTO assigned_user_wallet_id
                FROM public.wallets
                WHERE user_id = NEW.assigned_to;
                
                -- Récupérer le budget et le titre de la tâche
                task_budget := NEW.budget_credits;
                task_title := NEW.title;
                
                IF assigned_user_wallet_id IS NOT NULL AND task_budget > 0 THEN
                    -- Insérer une transaction de crédit
                    INSERT INTO public.transactions (
                        wallet_id, 
                        type, 
                        amount, 
                        description, 
                        reference_type, 
                        reference_id, 
                        status, 
                        metadata,
                        created_at
                    ) VALUES (
                        assigned_user_wallet_id,
                        'credit',
                        task_budget,
                        'Gain pour l''aide apportée à la tâche: ' || task_title,
                        'task_completion',
                        NEW.id::text,
                        'completed',
                        jsonb_build_object(
                            'task_title', task_title,
                            'task_id', NEW.id,
                            'task_owner', NEW.user_id
                        ),
                        NOW()
                    );
                    
                    -- Mettre à jour le solde du wallet
                    UPDATE public.wallets
                    SET 
                        balance = balance + task_budget,
                        total_earned = total_earned + task_budget,
                        updated_at = NOW()
                    WHERE id = assigned_user_wallet_id;
                    
                    RAISE NOTICE 'Crédit de % accordé à l''utilisateur % pour la tâche %', task_budget, NEW.assigned_to, NEW.title;
                ELSE
                    RAISE WARNING 'Impossible de créditer l''utilisateur % pour la tâche %. Wallet non trouvé ou budget nul.', NEW.assigned_to, NEW.title;
                END IF;
            ELSE
                RAISE NOTICE 'L''utilisateur a déjà été crédité pour la tâche %', NEW.id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS credit_assigned_user_trigger ON public.tasks;
DROP TRIGGER IF EXISTS trigger_credit_on_task_completion ON public.tasks;

-- 3. Créer le nouveau trigger
CREATE TRIGGER credit_assigned_user_trigger
    AFTER UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.credit_assigned_user_on_task_completion();

-- 4. Vérifier que les colonnes nécessaires existent dans la table tasks
DO $$
BEGIN
    -- Vérifier assigned_to
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tasks' 
          AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN assigned_to uuid REFERENCES auth.users(id);
        RAISE NOTICE 'Colonne assigned_to ajoutée à la table tasks';
    END IF;
    
    -- Vérifier budget_credits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tasks' 
          AND column_name = 'budget_credits'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN budget_credits integer DEFAULT 0;
        RAISE NOTICE 'Colonne budget_credits ajoutée à la table tasks';
    END IF;
    
    -- Vérifier completion_date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tasks' 
          AND column_name = 'completion_date'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN completion_date timestamp without time zone;
        RAISE NOTICE 'Colonne completion_date ajoutée à la table tasks';
    END IF;
END $$;

-- 5. Créer un wallet pour tous les utilisateurs existants qui n'en ont pas
INSERT INTO public.wallets (user_id, balance, total_earned, created_at, updated_at)
SELECT 
    u.id,
    0,
    0,
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.wallets w ON u.id = w.user_id
WHERE w.id IS NULL;

-- 6. Mettre à jour les tâches terminées existantes pour ajouter completion_date si manquante
UPDATE public.tasks 
SET completion_date = updated_at
WHERE status = 'completed' 
  AND completion_date IS NULL;

-- 7. Créer une fonction de test pour vérifier le système
CREATE OR REPLACE FUNCTION test_credit_system(task_id_param integer)
RETURNS TEXT AS $$
DECLARE
    task_record RECORD;
    wallet_record RECORD;
    transaction_count integer;
    result_text TEXT;
BEGIN
    -- Récupérer la tâche
    SELECT * INTO task_record FROM public.tasks WHERE id = task_id_param;
    
    IF NOT FOUND THEN
        RETURN '❌ Tâche non trouvée';
    END IF;
    
    -- Vérifier si la tâche est terminée et assignée
    IF task_record.status != 'completed' THEN
        RETURN '⚠️ Tâche non terminée (statut: ' || task_record.status || ')';
    END IF;
    
    IF task_record.assigned_to IS NULL THEN
        RETURN '⚠️ Tâche non assignée';
    END IF;
    
    IF task_record.budget_credits <= 0 THEN
        RETURN '⚠️ Budget de crédits nul ou négatif (' || task_record.budget_credits || ')';
    END IF;
    
    -- Récupérer le wallet de l'utilisateur assigné
    SELECT * INTO wallet_record FROM public.wallets WHERE user_id = task_record.assigned_to;
    
    IF NOT FOUND THEN
        RETURN '❌ Wallet non trouvé pour l''utilisateur assigné';
    END IF;
    
    -- Vérifier les transactions de crédit
    SELECT COUNT(*) INTO transaction_count
    FROM public.transactions
    WHERE reference_type = 'task_completion'
      AND reference_id = task_id_param::text
      AND type = 'credit'
      AND status = 'completed';
    
    IF transaction_count = 0 THEN
        RETURN '❌ Aucune transaction de crédit trouvée pour cette tâche';
    END IF;
    
    result_text := '✅ Système fonctionnel - ';
    result_text := result_text || 'Tâche: ' || task_record.title || ' | ';
    result_text := result_text || 'Assigné à: ' || task_record.assigned_to || ' | ';
    result_text := result_text || 'Budget: ' || task_record.budget_credits || ' crédits | ';
    result_text := result_text || 'Wallet solde: ' || wallet_record.balance || ' | ';
    result_text := result_text || 'Transactions: ' || transaction_count;
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- 8. Message de confirmation
SELECT 
    '🎉 SYSTÈME DE CRÉDIT AUTOMATIQUE ACTIVÉ !' as message,
    'La fonction credit_assigned_user_on_task_completion a été créée' as fonction,
    'Le trigger credit_assigned_user_trigger a été activé' as trigger,
    'Tous les utilisateurs ont maintenant un wallet' as wallets,
    'Utilisez SELECT test_credit_system(task_id) pour tester' as test;
