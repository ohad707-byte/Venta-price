alter table promotions enable row level security;

drop policy if exists allow_read_promotions on promotions;
create policy allow_read_promotions on promotions for select using (true);

drop policy if exists allow_insert_promotions on promotions;
create policy allow_insert_promotions on promotions for insert with check (true);

drop policy if exists allow_update_promotions on promotions;
create policy allow_update_promotions on promotions for update using (true) with check (true);

drop policy if exists allow_delete_promotions on promotions;
create policy allow_delete_promotions on promotions for delete using (true);