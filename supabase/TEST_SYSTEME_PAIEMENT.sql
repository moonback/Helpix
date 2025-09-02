-- 🧪 Script de test pour le système de paiement automatique
-- Ce script permet de tester le système de paiement en créant des données de test

-- ⚠️ IMPORTANT: Remplacez les UUIDs ci-dessous par de vrais UUIDs d'utilisateurs existants
-- Vous pouvez obtenir les UUIDs avec cette requête:
-- SELECT id FROM auth.users LIMIT 2;

-- 1. Créer des utilisateurs de test (si nécessaire)
-- Note: Les utilisateurs doivent être créés via l'interface d'authentification

-- 2. Créer des wallets de test
-- Assurez-vous que les utilisateurs ont des wallets avec des soldes suffisants

-- 3. Créer une tâche de test
-- ⚠️ REMPLACEZ '00000000-0000-0000-0000-000000000001' par un vrai UUID d'utilisateur
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
  '00000000-0000-0000-0000-000000000001', -- ⚠️ UUID du créateur de la tâche
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

-- 4. Assigner la tâche à un utilisateur
-- ⚠️ REMPLACEZ '00000000-0000-0000-0000-000000000002' par un vrai UUID d'utilisateur
-- ⚠️ REMPLACEZ 1 par l'ID réel de la tâche créée ci-dessus
UPDATE tasks 
SET 
  assigned_to = '00000000-0000-0000-0000-000000000002', -- ⚠️ UUID de l'aideur
  status = 'in_progress',
  updated_at = NOW()
WHERE id = 1; -- ⚠️ ID de la tâche créée

-- 5. Marquer la tâche comme terminée (déclenche le paiement automatique)
UPDATE tasks 
SET 
  status = 'completed',
  completion_date = NOW(),
  progress_percentage = 100,
  updated_at = NOW()
WHERE id = 1; -- ⚠️ ID de la tâche créée

-- 6. Vérifier les transactions créées
-- ⚠️ REMPLACEZ 1 par l'ID réel de la tâche créée
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
  AND t.reference_id = '1' -- ⚠️ ID de la tâche créée
ORDER BY t.created_at;

-- 7. Vérifier les soldes des wallets
-- ⚠️ REMPLACEZ les UUIDs par les vrais UUIDs utilisés
SELECT 
  w.user_id,
  w.balance,
  w.total_earned,
  w.total_spent,
  w.updated_at
FROM wallets w
WHERE w.user_id IN (
  '00000000-0000-0000-0000-000000000001', -- ⚠️ UUID du créateur
  '00000000-0000-0000-0000-000000000002'  -- ⚠️ UUID de l'aideur
)
ORDER BY w.user_id;

-- 8. Vérifier que le paiement a été traité
-- ⚠️ REMPLACEZ 1 par l'ID réel de la tâche créée
SELECT 
  CASE 
    WHEN COUNT(*) = 2 THEN 'Paiement traité correctement'
    ELSE 'Paiement incomplet ou non traité'
  END as status_paiement,
  COUNT(*) as nombre_transactions
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.reference_id = '1' -- ⚠️ ID de la tâche créée
  AND t.type IN ('credit', 'debit');

-- 9. Nettoyer les données de test (optionnel)
-- ⚠️ REMPLACEZ 1 par l'ID réel de la tâche créée
-- DELETE FROM transactions WHERE reference_type = 'task_completion' AND reference_id = '1';
-- DELETE FROM tasks WHERE id = 1;

-- 📊 Requêtes de monitoring

-- Nombre de paiements traités aujourd'hui
SELECT 
  DATE(created_at) as date,
  COUNT(*) as paiements_traites
FROM transactions 
WHERE reference_type = 'task_completion'
  AND DATE(created_at) = CURRENT_DATE
GROUP BY DATE(created_at);

-- Montant total des paiements par jour
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

-- Top des utilisateurs qui reçoivent le plus de paiements
SELECT 
  t.metadata->>'task_owner' as createur_id,
  COUNT(*) as nombre_paiements_recus,
  SUM(t.amount) as montant_total_recu
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.type = 'credit'
  AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY t.metadata->>'task_owner'
ORDER BY montant_total_recu DESC
LIMIT 10;

-- Top des utilisateurs qui paient le plus
SELECT 
  t.metadata->>'helper_user_id' as aideur_id,
  COUNT(*) as nombre_paiements_effectues,
  SUM(t.amount) as montant_total_paye
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND t.type = 'debit'
  AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY t.metadata->>'helper_user_id'
ORDER BY montant_total_paye DESC
LIMIT 10;

-- Tâches avec paiements en attente (statut completed mais pas de transactions)
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

-- Transactions orphelines (sans tâche correspondante)
SELECT 
  t.id,
  t.type,
  t.amount,
  t.reference_id,
  t.created_at
FROM transactions t
WHERE t.reference_type = 'task_completion'
  AND NOT EXISTS (
    SELECT 1 FROM tasks ts 
    WHERE ts.id = t.reference_id::integer
  )
ORDER BY t.created_at DESC;
