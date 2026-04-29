alter table orders
  add column if not exists delivery_method text default 'delivery' check (delivery_method in ('delivery', 'pickup')),
  add column if not exists pickup_location text,
  add column if not exists installment_months integer,
  add column if not exists estimated_delivery_date date;

alter table order_items
  add column if not exists warranty_months integer,
  add column if not exists delivery_estimate text;

create index if not exists orders_delivery_method_idx on orders(delivery_method);
create index if not exists orders_estimated_delivery_date_idx on orders(estimated_delivery_date);
