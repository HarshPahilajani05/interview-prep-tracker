-- Enable RLS
alter table public.submissions enable row level security;

-- READ: users can see only their rows
drop policy if exists "submissions_select_own" on public.submissions;
create policy "submissions_select_own"
on public.submissions
for select
to authenticated
using (user_id = auth.uid());

-- INSERT: users can insert only for themselves
drop policy if exists "submissions_insert_own" on public.submissions;
create policy "submissions_insert_own"
on public.submissions
for insert
to authenticated
with check (user_id = auth.uid());

-- DELETE: users can delete only their rows
drop policy if exists "submissions_delete_own" on public.submissions;
create policy "submissions_delete_own"
on public.submissions
for delete
to authenticated
using (user_id = auth.uid());
