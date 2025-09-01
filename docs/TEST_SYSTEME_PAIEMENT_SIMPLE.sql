-- 🧪 Script de test simple pour le système de paiement
-- Ce script utilise des utilisateurs existants dans votre base de données

-- 1. Vérifier les utilisateurs existants
SELECT 
  'Utilisateurs disponibles pour les tests:' as info,
  u.id,
  u.email,
  w.balance,
  w.total_earned,
  w.total_spent
FROM auth.users u
LEFT JOIN wallets w ON w.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 2. Créer une tâche de test avec le premier utilisateur disponible
-- (Remplacez USER_ID_1 par un vrai UUID d'utilisateur)
/*
INSERT INTO tasks (
  user_id,
  title,
  description,
  category,
  status,
  priority,
  estimated_duration,
  budget_credits,
  required_skills,
  tags,
  location,
  latitude,
  longitude,
  created_at
) VALUES (
  'USER_ID_1', -- Remplacez par un UUID d'utilisateur existant
  'Test de paiement automatique',
  'Cette tâche sert à tester le système de paiement automatique',
  'local',
  'open',
  'medium',
  2,
  25, -- 25 crédits
  ARRAY['test', 'paiement'],
  ARRAY['test', 'automatique'],
  'Paris, France',
  48.8566,
  2.3522,
  NOW()
);
*/

-- 3. Assigner la tâche à un autre utilisateur
-- (Remplacez TASK_ID et USER_ID_2 par les vraies valeurs)
/*
UPDATE tasks 
SET 
  assigned_to = 'USER_ID_2', -- Remplacez par un autre UUID d'utilisateur
  status = 'in_progress',
  updated_at = NOW()
WHERE id = TASK_ID; -- Remplacez par l'ID de la tâche créée
*/

-- 4. Marquer la tâche comme terminée (déclenche le paiement automatique)
/*
UPDATE tasks 
SET 
  status = 'completed',
  completion_date = NOW(),
  progress_percentage = 100,
  updated_at = NOW()
WHERE id = TASK_ID; -- Remplacez par l'ID de la tâche créée
*/

-- 5. Vérifier les transactions créées
/*
SELECT 
  t.id,
  t.type,
  t.amount,
  t.description,
  t.status,
  t.created_at,
  t.metadata
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.reference_id = 'TASK_ID' -- Remplacez par l'ID de la tâche
ORDER BY t.created_at;
*/

-- 6. Vérifier les soldes des wallets
/*
SELECT 
  w.user_id,
  w.balance,
  w.total_earned,
  w.total_spent,
  w.updated_at
FROM wallets w
WHERE w.user_id IN ('USER_ID_1', 'USER_ID_2') -- Remplacez par les vrais UUIDs
ORDER BY w.user_id;
*/

-- 7. Vérifier que le paiement a été traité
/*
SELECT 
  CASE 
    WHEN COUNT(*) = 2 THEN 'Paiement traité correctement'
    ELSE 'Paiement incomplet ou non traité'
  END as status_paiement,
  COUNT(*) as nombre_transactions
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.reference_id = 'TASK_ID' -- Remplacez par l'ID de la tâche
  AND t.type IN ('credit', 'debit');
*/

-- 📊 Requêtes de monitoring (fonctionnent sans modification)

-- Nombre de paiements traités aujourd'hui
SELECT 
  DATE(created_at) as date,
  COUNT(*) as paiements_traites
FROM transactions 
WHERE reference_type = 'task_completion'
  AND DATE(created_at) = CURRENT_DATE
GROUP BY DATE(created_at);

-- Montant total des paiements par jour (7 derniers jours)
SELECT 
  DATE(created_at) as date,
  SUM(amount) as montant_total,
  COUNT(*) as nombre_transactions
FROM transactions 
WHERE reference_type = 'task_completion'
  AND type = 'credit'
  AND DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Tâches avec paiements en attente
SELECT 
  t.id,
  t.title,
  t.budget_credits,
  t.status,
  t.completion_date,
  CASE 
    WHEN tr.id IS NULL THEN 'Paiement en attente'
    ELSE 'Paiement traité'
  END as statut_paiement
FROM tasks t
LEFT JOIN transactions tr ON tr.reference_type = 'task_completion' 
  AND tr.reference_id = t.id::text
WHERE t.status = 'completed'
  AND t.budget_credits > 0
  AND t.assigned_to IS NOT NULL
ORDER BY t.completion_date DESC;

-- 🔍 Diagnostic des erreurs

-- Transactions échouées
SELECT 
  t.id,
  t.type,
  t.amount,
  t.status,
  t.description,
  t.created_at,
  t.metadata
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.status = 'failed'
ORDER BY t.created_at DESC;

-- Wallets avec solde négatif (erreur possible)
SELECT 
  w.user_id,
  w.balance,
  w.total_earned,
  w.total_spent,
  w.updated_at
FROM wallets w
WHERE w.balance < 0
ORDER BY w.balance ASC;
