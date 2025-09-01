-- Script pour créer la fonction de crédit automatique lors de la completion d'une tâche
-- Cette fonction sera appelée automatiquement via un trigger

-- 1. Créer la fonction de crédit automatique
CREATE OR REPLACE FUNCTION credit_user_on_task_completion()
RETURNS TRIGGER AS $$
DECLARE
    user_wallet_id UUID;
    existing_credit_count INTEGER;
BEGIN
    -- Vérifier si la tâche vient d'être marquée comme terminée
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Vérifier que la tâche a un utilisateur assigné et un budget de crédits
        IF NEW.assigned_to IS NOT NULL AND NEW.budget_credits > 0 THEN
            -- Vérifier si l'utilisateur a déjà été crédité pour cette tâche
            SELECT COUNT(*) INTO existing_credit_count
            FROM transactions
            WHERE reference_type = 'task_completion'
              AND reference_id = NEW.id::text
              AND type = 'credit';
            
            -- Si l'utilisateur n'a pas encore été crédité
            IF existing_credit_count = 0 THEN
                -- Récupérer l'ID du wallet de l'utilisateur assigné
                SELECT id INTO user_wallet_id
                FROM wallets
                WHERE user_id = NEW.assigned_to;
                
                -- Si le wallet existe
                IF user_wallet_id IS NOT NULL THEN
                    -- Créer la transaction de crédit
                    INSERT INTO transactions (
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
                        user_wallet_id,
                        'credit',
                        NEW.budget_credits,
                        'Gain pour l''aide apportée à la tâche: ' || NEW.title,
                        'task_completion',
                        NEW.id::text,
                        'completed',
                        jsonb_build_object(
                            'task_title', NEW.title,
                            'task_id', NEW.id,
                            'task_owner', NEW.user_id
                        ),
                        NOW()
                    );
                    
                    -- Mettre à jour le solde du wallet
                    UPDATE wallets
                    SET balance = balance + NEW.budget_credits,
                        total_earned = total_earned + NEW.budget_credits,
                        updated_at = NOW()
                    WHERE id = user_wallet_id;
                    
                    -- Log de confirmation
                    RAISE NOTICE 'Crédit automatique: % crédits accordés à l''utilisateur % pour la tâche "%"', 
                        NEW.budget_credits, NEW.assigned_to, NEW.title;
                ELSE
                    RAISE WARNING 'Wallet non trouvé pour l''utilisateur %', NEW.assigned_to;
                END IF;
            ELSE
                RAISE NOTICE 'L''utilisateur a déjà été crédité pour la tâche %', NEW.id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Créer le trigger qui appelle la fonction
DROP TRIGGER IF EXISTS trigger_credit_on_task_completion ON tasks;
CREATE TRIGGER trigger_credit_on_task_completion
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION credit_user_on_task_completion();

-- 3. Créer une fonction pour créditer manuellement un utilisateur (optionnel)
CREATE OR REPLACE FUNCTION manual_credit_for_task(
    p_task_id INTEGER,
    p_user_id UUID,
    p_amount DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
    user_wallet_id UUID;
    task_title TEXT;
    task_owner_id UUID;
    existing_credit_count INTEGER;
BEGIN
    -- Récupérer les informations de la tâche
    SELECT title, user_id INTO task_title, task_owner_id
    FROM tasks
    WHERE id = p_task_id;
    
    IF task_title IS NULL THEN
        RAISE EXCEPTION 'Tâche non trouvée: %', p_task_id;
    END IF;
    
    -- Vérifier si l'utilisateur a déjà été crédité pour cette tâche
    SELECT COUNT(*) INTO existing_credit_count
    FROM transactions
    WHERE reference_type = 'task_completion'
      AND reference_id = p_task_id::text
      AND type = 'credit';
    
    IF existing_credit_count > 0 THEN
        RAISE EXCEPTION 'L''utilisateur a déjà été crédité pour cette tâche';
    END IF;
    
    -- Récupérer l'ID du wallet de l'utilisateur
    SELECT id INTO user_wallet_id
    FROM wallets
    WHERE user_id = p_user_id;
    
    IF user_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Wallet non trouvé pour l''utilisateur: %', p_user_id;
    END IF;
    
    -- Créer la transaction de crédit
    INSERT INTO transactions (
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
        user_wallet_id,
        'credit',
        p_amount,
        'Crédit manuel pour la tâche: ' || task_title,
        'task_completion',
        p_task_id::text,
        'completed',
        jsonb_build_object(
            'task_title', task_title,
            'task_id', p_task_id,
            'task_owner', task_owner_id,
            'manual_credit', true
        ),
        NOW()
    );
    
    -- Mettre à jour le solde du wallet
    UPDATE wallets
    SET balance = balance + p_amount,
        total_earned = total_earned + p_amount,
        updated_at = NOW()
    WHERE id = user_wallet_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer une vue pour voir les crédits accordés par tâche
CREATE OR REPLACE VIEW task_credits_summary AS
SELECT 
    t.id as task_id,
    t.title as task_title,
    t.assigned_to as user_id,
    t.budget_credits,
    t.status,
    t.completion_date,
    tr.id as transaction_id,
    tr.amount as credited_amount,
    tr.created_at as credit_date,
    tr.metadata
FROM tasks t
LEFT JOIN transactions tr ON (
    tr.reference_type = 'task_completion' 
    AND tr.reference_id = t.id::text 
    AND tr.type = 'credit'
)
WHERE t.status = 'completed'
ORDER BY t.completion_date DESC;

-- 5. Message de confirmation
SELECT 'Fonction de crédit automatique créée avec succès!' as message;
