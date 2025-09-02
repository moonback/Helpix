-- Système de location d'objets (crédits)
begin;

-- 1) Colonnes de location sur items
alter table if exists public.items add column if not exists is_rentable boolean not null default false;
alter table if exists public.items add column if not exists daily_price integer; -- en crédits / jour
alter table if exists public.items add column if not exists deposit integer not null default 0; -- en crédits

-- 2) Type statut (si non existant)
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'rental_status_enum'
  ) then
    create type rental_status_enum as enum ('requested','accepted','active','completed','cancelled');
  end if;
end $$;

-- 3) Table rentals
create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  item_id integer not null references public.items(id) on delete cascade,
  owner_id uuid not null,
  renter_id uuid not null,
  start_date date not null,
  end_date date not null,
  daily_price integer not null,
  total_credits integer not null,
  deposit_credits integer not null default 0,
  status rental_status_enum not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Trigger updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists rentals_set_updated_at on public.rentals;
create trigger rentals_set_updated_at before update on public.rentals
for each row execute procedure public.set_updated_at();

-- 5) RLS
alter table public.rentals enable row level security;

-- Policies idempotentes
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'rentals' and policyname = 'rentals_select_owner_renter') then
    create policy rentals_select_owner_renter on public.rentals for select
      using (auth.uid() = owner_id or auth.uid() = renter_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'rentals' and policyname = 'rentals_insert_renter') then
    create policy rentals_insert_renter on public.rentals for insert
      with check (auth.uid() = renter_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'rentals' and policyname = 'rentals_update_owner') then
    create policy rentals_update_owner on public.rentals for update
      using (auth.uid() = owner_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'rentals' and policyname = 'rentals_delete_owner') then
    create policy rentals_delete_owner on public.rentals for delete
      using (auth.uid() = owner_id);
  end if;
end $$;

commit;


