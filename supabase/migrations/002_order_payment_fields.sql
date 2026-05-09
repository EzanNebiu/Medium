alter table orders
  add column if not exists payment_provider text default 'whatsapp',
  add column if not exists payment_status text default 'pending' check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded'));

create index if not exists orders_payment_status_idx on orders(payment_status);
