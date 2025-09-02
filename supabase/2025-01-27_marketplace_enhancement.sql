-- Amélioration du système de marketplace
-- Ajout des colonnes manquantes pour un marketplace complet

-- Activer l'extension earthdistance pour les calculs de distance géographique
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;

begin;

-- 1) Ajouter les colonnes manquantes à la table items
alter table if exists public.items add column if not exists category text;
alter table if exists public.items add column if not exists condition text;
alter table if exists public.items add column if not exists images text[] default '{}';
alter table if exists public.items add column if not exists tags text[] default '{}';
alter table if exists public.items add column if not exists location text;
alter table if exists public.items add column if not exists latitude double precision;
alter table if exists public.items add column if not exists longitude double precision;
alter table if exists public.items add column if not exists created_at timestamptz not null default now();
alter table if exists public.items add column if not exists updated_at timestamptz not null default now();

-- 2) Contraintes pour les nouvelles colonnes
do $$
begin
  -- Contrainte pour category
  if not exists (
    select 1 from pg_constraint
    where conname = 'items_category_check'
  ) then
    alter table public.items
      add constraint items_category_check
      check (category in ('tools','vehicles','sports','electronics','home','garden','books','clothing','musical','photography','outdoor','other'));
  end if;

  -- Contrainte pour condition
  if not exists (
    select 1 from pg_constraint
    where conname = 'items_condition_check'
  ) then
    alter table public.items
      add constraint items_condition_check
      check (condition in ('excellent','good','fair','poor'));
  end if;
end $$;

-- 3) Table pour les avis de location
create table if not exists public.rental_reviews (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  item_id integer not null references public.items(id) on delete cascade,
  reviewer_id uuid not null,
  reviewee_id uuid not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Trigger updated_at pour items
drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at before update on public.items
for each row execute procedure public.set_updated_at();

-- 5) Trigger updated_at pour rental_reviews
drop trigger if exists rental_reviews_set_updated_at on public.rental_reviews;
create trigger rental_reviews_set_updated_at before update on public.rental_reviews
for each row execute procedure public.set_updated_at();

-- 6) RLS pour rental_reviews
alter table public.rental_reviews enable row level security;

-- Policies pour rental_reviews
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'rental_reviews' and policyname = 'rental_reviews_select_all') then
    create policy rental_reviews_select_all on public.rental_reviews for select
      using (true);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'rental_reviews' and policyname = 'rental_reviews_insert_reviewer') then
    create policy rental_reviews_insert_reviewer on public.rental_reviews for insert
      with check (auth.uid() = reviewer_id);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'rental_reviews' and policyname = 'rental_reviews_update_reviewer') then
    create policy rental_reviews_update_reviewer on public.rental_reviews for update
      using (auth.uid() = reviewer_id);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'rental_reviews' and policyname = 'rental_reviews_delete_reviewer') then
    create policy rental_reviews_delete_reviewer on public.rental_reviews for delete
      using (auth.uid() = reviewer_id);
  end if;
end $$;

-- 7) Mettre à jour les policies existantes pour items
do $$
begin
  -- Permettre la lecture de tous les items rentables
  if not exists (select 1 from pg_policies where tablename = 'items' and policyname = 'items_select_rentable') then
    create policy items_select_rentable on public.items for select
      using (is_rentable = true);
  end if;
  
  -- Permettre la lecture de ses propres items
  if not exists (select 1 from pg_policies where tablename = 'items' and policyname = 'items_select_own') then
    create policy items_select_own on public.items for select
      using (auth.uid() = user_id);
  end if;
  
  -- Permettre l'insertion d'items par l'utilisateur authentifié
  if not exists (select 1 from pg_policies where tablename = 'items' and policyname = 'items_insert_own') then
    create policy items_insert_own on public.items for insert
      with check (auth.uid() = user_id);
  end if;
  
  -- Permettre la mise à jour de ses propres items
  if not exists (select 1 from pg_policies where tablename = 'items' and policyname = 'items_update_own') then
    create policy items_update_own on public.items for update
      using (auth.uid() = user_id);
  end if;
  
  -- Permettre la suppression de ses propres items
  if not exists (select 1 from pg_policies where tablename = 'items' and policyname = 'items_delete_own') then
    create policy items_delete_own on public.items for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- 8) Index pour améliorer les performances
create index if not exists idx_items_category on public.items(category) where is_rentable = true;
create index if not exists idx_items_condition on public.items(condition) where is_rentable = true;
create index if not exists idx_items_daily_price on public.items(daily_price) where is_rentable = true;
create index if not exists idx_items_available on public.items(available) where is_rentable = true;
create index if not exists idx_items_location on public.items using gist(ll_to_earth(latitude, longitude)) where latitude is not null and longitude is not null;

create index if not exists idx_rental_reviews_item_id on public.rental_reviews(item_id);
create index if not exists idx_rental_reviews_rating on public.rental_reviews(rating);

-- 9) Fonction pour calculer la note moyenne d'un item
create or replace function public.calculate_item_average_rating(item_id_param integer)
returns numeric as $$
declare
  avg_rating numeric;
begin
  select coalesce(avg(rating), 0) into avg_rating
  from public.rental_reviews
  where item_id = item_id_param;
  
  return avg_rating;
end;
$$ language plpgsql;

-- 10) Fonction pour compter le nombre total de locations d'un item
create or replace function public.count_item_rentals(item_id_param integer)
returns integer as $$
declare
  rental_count integer;
begin
  select count(*) into rental_count
  from public.rentals
  where item_id = item_id_param and status = 'completed';
  
  return rental_count;
end;
$$ language plpgsql;

-- 11) Vue pour les statistiques du marketplace
drop view if exists public.marketplace_stats;
create view public.marketplace_stats as
select 
  count(*) as total_items,
  count(*) filter (where available = true) as available_items,
  count(*) filter (where is_rentable = true) as rentable_items,
  avg(daily_price) filter (where daily_price is not null) as average_price,
  count(distinct user_id) as total_owners
from public.items
where is_rentable = true;

-- 12) Vue pour les items avec leurs statistiques
drop view if exists public.items_with_stats;
create view public.items_with_stats as
select 
  i.*,
  public.calculate_item_average_rating(i.id) as average_rating,
  public.count_item_rentals(i.id) as total_rentals,
  u.name as owner_name,
  u.avatar_url as owner_avatar
from public.items i
left join public.users u on i.user_id = u.id
where i.is_rentable = true;

-- 13) Données de test pour les catégories
insert into public.items (
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
  location,
  latitude,
  longitude
) values 
(
  (select id from public.users limit 1),
  'Perceuse Bosch Professional',
  'Perceuse visseuse Bosch Professional GSB 18V-21, parfaite pour tous vos travaux de bricolage. Batterie incluse.',
  'tools',
  'excellent',
  15,
  50,
  true,
  true,
  ARRAY['bricolage', 'perceuse', 'professionnel'],
  'Paris, France',
  48.8566,
  2.3522
),
(
  (select id from public.users limit 1),
  'Vélo électrique',
  'Vélo électrique pliable, idéal pour les trajets urbains. Autonomie de 50km.',
  'vehicles',
  'good',
  25,
  100,
  true,
  true,
  ARRAY['vélo', 'électrique', 'urbain'],
  'Lyon, France',
  45.7640,
  4.8357
),
(
  (select id from public.users limit 1),
  'Raquette de tennis',
  'Raquette de tennis Wilson Pro Staff, utilisée par les professionnels.',
  'sports',
  'fair',
  8,
  30,
  true,
  true,
  ARRAY['tennis', 'sport', 'wilson'],
  'Marseille, France',
  43.2965,
  5.3698
)
on conflict do nothing;

commit;
