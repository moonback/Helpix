-- Normalisation des tables skills et items
-- Objectif: remplacer skill_name (concat) par (name, level) et item_name par name
-- Sécurisé et idempotent: peut être exécuté plusieurs fois

begin;

-- 1) SKILLS: ajouter colonnes normalisées
alter table if exists public.skills add column if not exists name text;
alter table if exists public.skills add column if not exists level text;

-- 1.1) Contraintes de valeurs pour level (vérifiée après migration des données)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'skills_level_check'
  ) then
    alter table public.skills
      add constraint skills_level_check
      check (level in ('Débutant','Intermédiaire','Avancé','Expert'));
  end if;
end $$;

-- 1.2) Migration des données depuis skill_name (format "nom|niveau")
update public.skills
set name = coalesce(name, split_part(coalesce(skill_name, ''), '|', 1)),
    level = coalesce(level, nullif(split_part(coalesce(skill_name, ''), '|', 2), ''))
where (name is null or level is null);

-- Fallback: si level est encore null, mettre 'Intermédiaire'
update public.skills
set level = 'Intermédiaire'
where level is null;

-- 1.3) Rendre les nouvelles colonnes obligatoires
alter table public.skills alter column name set not null;
alter table public.skills alter column level set not null;

-- 1.4) Rendre l'ancienne colonne nullable (ou décommenter pour supprimer)
alter table if exists public.skills alter column skill_name drop not null;
-- alter table if exists public.skills drop column if exists skill_name;

-- 2) ITEMS: ajouter colonne normalisée
alter table if exists public.items add column if not exists name text;

-- 2.1) Migration des données depuis item_name
update public.items
set name = coalesce(name, item_name)
where name is null;

-- 2.2) Rendre la nouvelle colonne obligatoire
alter table public.items alter column name set not null;

-- 2.3) Rendre l'ancienne colonne nullable (ou décommenter pour supprimer)
alter table if exists public.items alter column item_name drop not null;
-- alter table if exists public.items drop column if exists item_name;

-- 3) RLS et Policies (si non présentes)
alter table if exists public.skills enable row level security;
alter table if exists public.items enable row level security;

-- Policies SKILLS
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'skills' and policyname = 'skills_select_own'
  ) then
    create policy skills_select_own on public.skills for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'skills' and policyname = 'skills_insert_own'
  ) then
    create policy skills_insert_own on public.skills for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'skills' and policyname = 'skills_update_own'
  ) then
    create policy skills_update_own on public.skills for update using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'skills' and policyname = 'skills_delete_own'
  ) then
    create policy skills_delete_own on public.skills for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Policies ITEMS
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'items' and policyname = 'items_select_own'
  ) then
    create policy items_select_own on public.items for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'items' and policyname = 'items_insert_own'
  ) then
    create policy items_insert_own on public.items for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'items' and policyname = 'items_update_own'
  ) then
    create policy items_update_own on public.items for update using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'items' and policyname = 'items_delete_own'
  ) then
    create policy items_delete_own on public.items for delete using (auth.uid() = user_id);
  end if;
end $$;

commit;


