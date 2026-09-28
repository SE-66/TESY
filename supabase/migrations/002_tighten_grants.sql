revoke all on table public.clivo_shop_state from public, anon, authenticated;
grant select, insert, update, delete on table public.clivo_shop_state to authenticated;

revoke all on table public.clivo_shop_listings from public, anon, authenticated;
grant select, insert, update, delete on table public.clivo_shop_listings to authenticated;
