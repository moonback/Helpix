-- Script pour ajouter des objets de test au marketplace
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier s'il y a déjà des objets
SELECT 'Nombre d''objets existants:' as info;
SELECT COUNT(*) as count FROM items;

-- 2. Ajouter des objets de test si la table est vide ou peu remplie
INSERT INTO items (
  user_id,
  name,
  description,
  category,
  condition,
  daily_price,
  deposit,
  is_rentable,
  available,
  tags,
  images,
  location,
  latitude,
  longitude
) VALUES 
-- Objet 1: Perceuse
(
  (SELECT id FROM users LIMIT 1),
  'Perceuse Bosch Professional',
  'Perceuse visseuse sans fil 18V, idéale pour tous vos travaux de bricolage. Batterie incluse.',
  'tools',
  'excellent',
  15.00,
  50.00,
  true,
  true,
  ARRAY['bricolage', 'perceuse', 'sans-fil', 'professionnel'],
  ARRAY['https://example.com/perceuse1.jpg'],
  'Paris, France',
  48.8566,
  2.3522
),
-- Objet 2: Vélo
(
  (SELECT id FROM users LIMIT 1),
  'Vélo de ville Trek',
  'Vélo de ville confortable, parfait pour les déplacements urbains. État impeccable.',
  'vehicles',
  'very_good',
  8.00,
  100.00,
  true,
  true,
  ARRAY['vélo', 'ville', 'transport', 'écologique'],
  ARRAY['https://example.com/velo1.jpg'],
  'Lyon, France',
  45.7640,
  4.8357
),
-- Objet 3: Appareil photo
(
  (SELECT id FROM users LIMIT 1),
  'Canon EOS R5',
  'Appareil photo professionnel, parfait pour la photographie et la vidéo. Objectif 24-70mm inclus.',
  'photography',
  'excellent',
  45.00,
  200.00,
  true,
  true,
  ARRAY['photo', 'professionnel', 'canon', 'vidéo'],
  ARRAY['https://example.com/camera1.jpg'],
  'Marseille, France',
  43.2965,
  5.3698
),
-- Objet 4: Râteau de jardin
(
  (SELECT id FROM users LIMIT 1),
  'Râteau de jardin en acier',
  'Râteau robuste pour l''entretien de votre jardin. Manche en bois de frêne.',
  'garden',
  'good',
  3.00,
  10.00,
  true,
  true,
  ARRAY['jardin', 'outil', 'entretien', 'extérieur'],
  ARRAY['https://example.com/rateau1.jpg'],
  'Toulouse, France',
  43.6047,
  1.4442
),
-- Objet 5: Guitare
(
  (SELECT id FROM users LIMIT 1),
  'Guitare acoustique Yamaha',
  'Guitare classique en épicéa, son chaleureux et équilibré. Parfait pour débuter.',
  'musical',
  'very_good',
  12.00,
  80.00,
  true,
  true,
  ARRAY['musique', 'guitare', 'acoustique', 'yamaha'],
  ARRAY['https://example.com/guitare1.jpg'],
  'Nice, France',
  43.7102,
  7.2620
),
-- Objet 6: Ordinateur portable
(
  (SELECT id FROM users LIMIT 1),
  'MacBook Pro 13 pouces',
  'Ordinateur portable Apple, parfait pour le travail et la création. SSD 256GB.',
  'electronics',
  'excellent',
  25.00,
  150.00,
  true,
  true,
  ARRAY['ordinateur', 'apple', 'macbook', 'professionnel'],
  ARRAY['https://example.com/macbook1.jpg'],
  'Nantes, France',
  47.2184,
  -1.5536
),
-- Objet 7: Tente de camping
(
  (SELECT id FROM users LIMIT 1),
  'Tente 4 personnes Quechua',
  'Tente de camping imperméable, facile à monter. Idéale pour les week-ends nature.',
  'outdoor',
  'good',
  10.00,
  60.00,
  true,
  true,
  ARRAY['camping', 'tente', 'nature', 'weekend'],
  ARRAY['https://example.com/tente1.jpg'],
  'Strasbourg, France',
  48.5734,
  7.7521
),
-- Objet 8: Livre de cuisine
(
  (SELECT id FROM users LIMIT 1),
  'Larousse Gastronomique',
  'Encyclopédie culinaire de référence, édition 2020. Parfait pour les passionnés de cuisine.',
  'books',
  'very_good',
  2.00,
  15.00,
  true,
  true,
  ARRAY['livre', 'cuisine', 'gastronomie', 'référence'],
  ARRAY['https://example.com/livre1.jpg'],
  'Bordeaux, France',
  44.8378,
  -0.5792
)
ON CONFLICT DO NOTHING;

-- 3. Vérifier le résultat
SELECT 'Objets ajoutés:' as info;
SELECT COUNT(*) as count FROM items;

-- 4. Afficher les objets par catégorie
SELECT 'Objets par catégorie:' as info;
SELECT 
  category,
  COUNT(*) as count
FROM items 
WHERE is_rentable = true
GROUP BY category
ORDER BY count DESC;

-- 5. Afficher quelques exemples
SELECT 'Exemples d''objets ajoutés:' as info;
SELECT 
  id,
  name,
  category,
  daily_price,
  available,
  is_rentable
FROM items 
WHERE is_rentable = true
ORDER BY created_at DESC
LIMIT 5;

-- 6. Message de confirmation
SELECT 'Objets de test ajoutés avec succès!' as message;
