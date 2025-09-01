-- Script de diagnostic du système de crédit automatique
-- Vérifie l'état actuel des tables, fonctions et triggers

-- 1. Vérifier l'existence des tables nécessaires
SELECT 
    'Tables' as type,
    table_name,
    CASE 
        WHEN table_name = 'wallets' THEN '✅ Table wallets existe'
        WHEN table_name = 'transactions' THEN '✅ Table transactions existe'
        WHEN table_name = 'tasks' THEN '✅ Table tasks existe'
        ELSE '❓ Table inconnue'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('wallets', 'transactions', 'tasks')
ORDER BY table_name;

-- 2. Vérifier l'existence de la fonction de crédit automatique
SELECT 
    'Fonction' as type,
    routine_name,
    CASE 
        WHEN routine_name = 'credit_assigned_user_on_task_completion' THEN '✅ Fonction de crédit existe'
        WHEN routine_name = 'credit_user_on_task_completion' THEN '✅ Fonction de crédit existe (ancienne version)'
        ELSE '❓ Fonction inconnue'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%credit%task%'
ORDER BY routine_name;

-- 3. Vérifier l'existence du trigger
SELECT 
    'Trigger' as type,
    trigger_name,
    event_object_table,
    CASE 
        WHEN trigger_name = 'credit_assigned_user_trigger' THEN '✅ Trigger de crédit existe'
        WHEN trigger_name = 'trigger_credit_on_task_completion' THEN '✅ Trigger de crédit existe (ancienne version)'
        ELSE '❓ Trigger inconnu'
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%credit%'
ORDER BY trigger_name;

-- 4. Vérifier les colonnes de la table tasks
SELECT 
    'Colonnes Tasks' as type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tasks'
  AND column_name IN ('assigned_to', 'budget_credits', 'status', 'completion_date')
ORDER BY column_name;

-- 5. Vérifier les colonnes de la table wallets
SELECT 
    'Colonnes Wallets' as type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'wallets'
  AND column_name IN ('user_id', 'balance', 'total_earned')
ORDER BY column_name;

-- 6. Vérifier les colonnes de la table transactions
SELECT 
    'Colonnes Transactions' as type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'transactions'
  AND column_name IN ('wallet_id', 'type', 'amount', 'reference_type', 'reference_id')
ORDER BY column_name;

-- 7. Vérifier les tâches récentes avec leur statut
SELECT 
    'Tâches récentes' as type,
    id,
    title,
    status,
    assigned_to,
    budget_credits,
    completion_date,
    CASE 
        WHEN status = 'completed' AND assigned_to IS NOT NULL THEN '🔍 Tâche terminée avec assigné - devrait être créditée'
        WHEN status = 'completed' AND assigned_to IS NULL THEN '⚠️ Tâche terminée sans assigné'
        WHEN status != 'completed' AND assigned_to IS NOT NULL THEN '📋 Tâche assignée en cours'
        ELSE '📝 Tâche ouverte'
    END as analyse
FROM tasks 
ORDER BY updated_at DESC 
LIMIT 10;

-- 8. Vérifier les transactions de crédit existantes
SELECT 
    'Transactions crédit' as type,
    id,
    wallet_id,
    type,
    amount,
    reference_type,
    reference_id,
    description,
    created_at
FROM transactions 
WHERE type = 'credit' 
  AND reference_type = 'task_completion'
ORDER BY created_at DESC 
LIMIT 10;

-- 9. Vérifier les wallets des utilisateurs
SELECT 
    'Wallets utilisateurs' as type,
    w.id as wallet_id,
    w.user_id,
    w.balance,
    w.total_earned,
    w.created_at,
    CASE 
        WHEN w.balance > 0 THEN '💰 Wallet avec crédits'
        WHEN w.balance = 0 THEN '💳 Wallet vide'
        ELSE '❓ Wallet inconnu'
    END as status
FROM wallets w
ORDER BY w.created_at DESC 
LIMIT 10;

-- 10. Message de résumé
SELECT 
    'RÉSUMÉ' as type,
    'Vérifiez les résultats ci-dessus pour diagnostiquer le système de crédit' as message,
    'Si des éléments manquent, exécutez les scripts de création appropriés' as action;
