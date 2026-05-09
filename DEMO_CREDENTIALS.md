# Medium Mobil Shop Demo Credentials

Use these credentials for a portfolio/demo account:

```txt
Admin URL: /admin
Email: demo.admin@mediummobil.shop
Password: MediumDemo2026!
Role: admin
```

Important: create this account only in a demo Supabase project, or be aware that anyone with these credentials can access admin tools.

## Create The Demo Admin In Supabase

1. Open Supabase Dashboard.
2. Go to Authentication > Users.
3. Click Add user.
4. Use:

```txt
Email: demo.admin@mediummobil.shop
Password: MediumDemo2026!
Auto Confirm User: enabled
```

5. Open SQL Editor and run:

```sql
insert into public.profiles (id, full_name, role)
select id, 'Demo Admin', 'admin'
from auth.users
where email = 'demo.admin@mediummobil.shop'
on conflict (id) do update
set full_name = excluded.full_name,
    role = 'admin',
    updated_at = now();
```

6. Log in with the demo credentials, then open `/admin`.

## Portfolio Text

```txt
Demo Admin
Email: demo.admin@mediummobil.shop
Password: MediumDemo2026!

After login, open /admin to view the dashboard, product management, orders, and phone import flow.
```
