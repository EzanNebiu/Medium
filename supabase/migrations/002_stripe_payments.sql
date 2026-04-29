alter table orders
  add column if not exists payment_provider text,
  add column if not exists payment_status text default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_payment_url text;

create index if not exists orders_payment_status_idx on orders(payment_status);
create index if not exists orders_stripe_checkout_session_id_idx on orders(stripe_checkout_session_id);
