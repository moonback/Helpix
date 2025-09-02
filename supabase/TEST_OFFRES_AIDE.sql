-- Script de test simple pour les offres d'aide
-- Exécutez ce script pour tester la connectivité et les permissions

-- 1. Test simple de sélection sur help_offers
SELECT COUNT(*) as help_offers_count FROM help_offers;

-- 2. Test simple de sélection sur help_offer_notifications  
SELECT COUNT(*) as notifications_count FROM help_offer_notifications;

-- 3. Test de sélection avec relations
SELECT 
  h.id,
  h.status,
  h.created_at,
  t.title as task_title,
  u.name as helper_name,
  u.email as helper_email
FROM help_offers h
LEFT JOIN tasks t ON t.id = h.task_id
LEFT JOIN users u ON u.id = h.helper_id
LIMIT 5;

-- 4. Test des fonctions
SELECT accept_help_offer('00000000-0000-0000-0000-000000000000'::uuid, 'Test') as test_accept;
SELECT reject_help_offer('00000000-0000-0000-0000-000000000000'::uuid, 'Test') as test_reject;
