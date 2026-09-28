create table if not exists public.clivo_shop_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cart jsonb not null default '[]'::jsonb,
  liked text[] not null default '{}'::text[],
  following text[] not null default '{}'::text[],
  updated_at timestamptz not null default now()
);

alter table public.clivo_shop_state enable row level security;

revoke all on table public.clivo_shop_state from anon;
grant select, insert, update, delete on table public.clivo_shop_state to authenticated;

create policy "clivo_shop_state_select_own"
on public.clivo_shop_state
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "clivo_shop_state_insert_own"
on public.clivo_shop_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "clivo_shop_state_update_own"
on public.clivo_shop_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "clivo_shop_state_delete_own"
on public.clivo_shop_state
for delete
to authenticated
using ((select auth.uid()) = user_id);

create table if not exists public.clivo_shop_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  store_handle text not null check (char_length(store_handle) between 1 and 64),
  name text not null check (char_length(name) between 1 and 120),
  price numeric(10,2) not null check (price >= 0),
  color text not null default 'bg-blue-700',
  emoji text not null default '📦',
  description text not null default '',
  likes integer not null default 0 check (likes >= 0),
  created_at timestamptz not null default now()
);

create index if not exists clivo_shop_listings_seller_id_idx
  on public.clivo_shop_listings (seller_id);
create index if not exists clivo_shop_listings_created_at_idx
  on public.clivo_shop_listings (created_at desc);

alter table public.clivo_shop_listings enable row level security;

revoke all on table public.clivo_shop_listings from anon;
grant select, insert, update, delete on table public.clivo_shop_listings to authenticated;

create policy "clivo_shop_listings_read_authenticated"
on public.clivo_shop_listings
for select
to authenticated
using (true);

create policy "clivo_shop_listings_insert_own"
on public.clivo_shop_listings
for insert
to authenticated
with check ((select auth.uid()) = seller_id);

create policy "clivo_shop_listings_update_own"
on public.clivo_shop_listings
for update
to authenticated
using ((select auth.uid()) = seller_id)
with check ((select auth.uid()) = seller_id);

create policy "clivo_shop_listings_delete_own"
on public.clivo_shop_listings
for delete
to authenticated
using ((select auth.uid()) = seller_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'clivo_shop_state'
  ) then
    execute 'alter publication supabase_realtime add table public.clivo_shop_state';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'clivo_shop_listings'
  ) then
    execute 'alter publication supabase_realtime add table public.clivo_shop_listings';
  end if;
end
$$;
