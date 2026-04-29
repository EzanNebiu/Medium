alter table profiles
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists delivery_notes text,
  add column if not exists preferred_delivery_method text default 'delivery' check (preferred_delivery_method in ('delivery', 'pickup'));

create index if not exists profiles_phone_idx on profiles(phone);
