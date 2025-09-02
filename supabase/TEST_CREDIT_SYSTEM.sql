-- Script de test du système de crédit automatique
-- Utilisez ce script pour tester le système avec des tâches existantes

-- 1. Vérifier l'état actuel du système
SELECT '=== DIAGNOSTIC DU SYSTÈME ===' as info;

-- Vérifier les tâches terminées avec assigné
SELECT 
    'Tâches terminées avec assigné' as type,
    t.id,
    t.title,
    t.status,
    t.assigned_to,
    t.budget_credits,
    t.completion_date,
    w.balance as wallet_balance,
    w.total_earned
FROM tasks t
LEFT JOIN wallets w ON t.assigned_to = w.user_id
WHERE t.status = 'completed' 
  AND t.assigned_to IS NOT NULL
ORDER BY t.updated_at DESC
LIMIT 5;

-- 2. Vérifier les transactions de crédit existantes
SELECT 
    'Transactions de crédit existantes' as type,
    tr.id,
    tr.wallet_id,
    tr.amount,
    tr.reference_type,
    tr.reference_id,
    tr.description,
    tr.created_at
FROM transactions tr
WHERE tr.type = 'credit' 
  AND tr.reference_type = 'task_completion'
ORDER BY tr.created_at DESC
LIMIT 5;

-- 3. Tester le système avec une tâche spécifique
-- Remplacez 1 par l'ID d'une tâche terminée avec assigné
SELECT test_credit_system(1) as test_result;

-- 4. Simuler le crédit manuel pour une tâche terminée (si nécessaire)
-- Décommentez et modifiez les valeurs selon vos besoins
/*
DO $$
DECLARE
    task_id_to_credit INTEGER := 1; -- ID de la tâche à créditer
    task_record RECORD;
    wallet_record RECORD;
    existing_credit_count INTEGER;
BEGIN
    -- Récupérer la tâche
    SELECT * INTO task_record FROM tasks WHERE id = task_id_to_credit;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Tâche non trouvée';
        RETURN;
    END IF;
    
    -- Vérifier si déjà créditée
    SELECT COUNT(*) INTO existing_credit_count
    FROM transactions
    WHERE reference_type = 'task_completion'
      AND reference_id = task_id_to_credit::text
      AND type = 'credit';
    
    IF existing_credit_count > 0 THEN
        RAISE NOTICE 'Tâche déjà créditée';
        RETURN;
    END IF;
    
    -- Récupérer le wallet
    SELECT * INTO wallet_record FROM wallets WHERE user_id = task_record.assigned_to;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Wallet non trouvé pour l''utilisateur %', task_record.assigned_to;
        RETURN;
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
        wallet_record.id,
        'credit',
        task_record.budget_credits,
        'Crédit manuel pour la tâche: ' || task_record.title,
        'task_completion',
        task_id_to_credit::text,
        'completed',
        jsonb_build_object(
            'task_title', task_record.title,
            'task_id', task_id_to_credit,
            'task_owner', task_record.user_id,
            'manual_credit', true
        ),
        NOW()
    );
    
    -- Mettre à jour le wallet
    UPDATE wallets
    SET 
        balance = balance + task_record.budget_credits,
        total_earned = total_earned + task_record.budget_credits,
        updated_at = NOW()
    WHERE id = wallet_record.id;
    
    RAISE NOTICE 'Crédit manuel de % accordé pour la tâche %', task_record.budget_credits, task_record.title;
END $$;
*/

-- 5. Vérifier les wallets des utilisateurs
SELECT 
    'Wallets utilisateurs' as type,
    w.id,
    w.user_id,
    w.balance,
    w.total_earned,
    w.created_at,
    w.updated_at
FROM wallets w
ORDER BY w.balance DESC
LIMIT 10;

-- 6. Statistiques du système de crédit
SELECT 
    'Statistiques du système' as type,
    COUNT(DISTINCT t.id) as total_tasks_completed,
    COUNT(DISTINCT t.assigned_to) as users_with_completed_tasks,
    SUM(t.budget_credits) as total_credits_available,
    COUNT(DISTINCT tr.id) as total_credit_transactions,
    SUM(tr.amount) as total_credits_distributed
FROM tasks t
LEFT JOIN transactions tr ON tr.reference_type = 'task_completion' 
    AND tr.reference_id = t.id::text 
    AND tr.type = 'credit'
WHERE t.status = 'completed' 
  AND t.assigned_to IS NOT NULL;

-- 7. Message final
SELECT 
    '=== RÉSUMÉ DU TEST ===' as info,
    'Si vous voyez des tâches terminées sans crédit, le système n''était pas encore activé' as note1,
    'Exécutez le script ACTIVER_CREDIT_AUTOMATIQUE.sql pour activer le système' as note2,
    'Les nouvelles tâches terminées seront automatiquement créditées' as note3;
