create extension if not exists "pgcrypto";

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  brand text,
  category_id uuid references categories(id),
  price numeric not null,
  old_price numeric,
  discount_percentage numeric,
  stock_quantity integer default 0,
  condition text,
  warranty_months integer,
  delivery_badge text,
  is_featured boolean default false,
  is_active boolean default true,
  main_image_url text,
  gallery_images jsonb default '[]',
  short_description text,
  full_description text,
  imported_from_api boolean default false,
  api_source text,
  api_device_id text,
  raw_api_response jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table product_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  display text,
  processor text,
  ram text,
  storage text,
  rear_camera text,
  front_camera text,
  battery text,
  charging text,
  operating_system text,
  network text,
  sim text,
  dimensions text,
  weight text,
  colors text,
  release_date text,
  full_specs jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table api_import_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id),
  search_query text,
  selected_device text,
  status text,
  error_message text,
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  customer_name text,
  customer_email text,
  customer_phone text,
  city text,
  address text,
  delivery_notes text,
  delivery_method text default 'delivery' check (delivery_method in ('delivery', 'pickup')),
  pickup_location text,
  payment_method text check (payment_method in ('cash', 'electronic-full', 'monthly')),
  installment_months integer,
  status text default 'pending',
  subtotal numeric,
  delivery_cost numeric,
  discount numeric,
  total numeric,
  estimated_delivery_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text,
  quantity integer,
  unit_price numeric,
  total_price numeric,
  warranty_months integer,
  delivery_estimate text,
  created_at timestamptz default now()
);

create table wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  product_id uuid references products(id),
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  product_id uuid references products(id),
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

alter table profiles enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;
alter table product_specs enable row level security;
alter table api_import_logs enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table wishlists enable row level security;
alter table reviews enable row level security;

create policy "Profiles read own" on profiles for select using (auth.uid() = id or is_admin());
create policy "Profiles insert own" on profiles for insert with check (auth.uid() = id);
create policy "Profiles update own" on profiles for update using (auth.uid() = id);
create policy "Admins manage profiles" on profiles for all using (is_admin()) with check (is_admin());

create policy "Public read categories" on categories for select using (true);
create policy "Admin manage categories" on categories for all using (is_admin()) with check (is_admin());
create policy "Public read brands" on brands for select using (true);
create policy "Admin manage brands" on brands for all using (is_admin()) with check (is_admin());

create policy "Public read active products" on products for select using (is_active = true or is_admin());
create policy "Admin manage products" on products for all using (is_admin()) with check (is_admin());

create policy "Public read active product specs" on product_specs for select using (
  exists(select 1 from products where products.id = product_specs.product_id and (products.is_active = true or is_admin()))
);
create policy "Admin manage product specs" on product_specs for all using (is_admin()) with check (is_admin());

create policy "Admin read import logs" on api_import_logs for select using (is_admin());
create policy "Admin insert import logs" on api_import_logs for insert with check (is_admin() or auth.uid() = admin_user_id);

create policy "Users read own orders" on orders for select using (auth.uid() = user_id or is_admin());
create policy "Users create orders" on orders for insert with check (user_id is null or auth.uid() = user_id);
create policy "Admin manage orders" on orders for all using (is_admin()) with check (is_admin());

create policy "Users read own order items" on order_items for select using (
  exists(select 1 from orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or is_admin()))
);
create policy "Users create order items" on order_items for insert with check (
  exists(select 1 from orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or orders.user_id is null))
);
create policy "Admin manage order items" on order_items for all using (is_admin()) with check (is_admin());

create policy "Users manage own wishlist" on wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read reviews" on reviews for select using (true);
create policy "Users manage own reviews" on reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admin manage reviews" on reviews for all using (is_admin()) with check (is_admin());

create policy "Public read product images" on storage.objects
for select using (bucket_id = 'product-images');

create policy "Admins upload product images" on storage.objects
for insert with check (bucket_id = 'product-images' and is_admin());

create policy "Admins update product images" on storage.objects
for update using (bucket_id = 'product-images' and is_admin()) with check (bucket_id = 'product-images' and is_admin());

create policy "Admins delete product images" on storage.objects
for delete using (bucket_id = 'product-images' and is_admin());

insert into categories(name, slug) values
('iPhone','iphone'),('Samsung Galaxy','samsung-galaxy'),('Xiaomi','xiaomi'),('Google Pixel','google-pixel'),('OnePlus','oneplus'),('Accessories','accessories'),('Chargers','chargers'),('Cases','cases'),('Earbuds','earbuds'),('Smartwatches','smartwatches');

insert into brands(name, slug) values
('Apple','apple'),('Samsung','samsung'),('Xiaomi','xiaomi'),('Google','google'),('OnePlus','oneplus'),('Medium Mobil','medium-mobil');
