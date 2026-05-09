# Medium Mobil Shop

Medium Mobil Shop is a React + Vite + TypeScript mobile phone e-commerce app with public shop pages, cart, wishlist, checkout, Supabase Auth, protected account routes, and an admin product/import workflow.

## Stack

- React + Vite + TypeScript
- Tailwind CSS with shadcn/ui-compatible component structure
- React Router DOM
- Supabase client, Auth, database tables, RLS policies
- Supabase Edge Functions for RapidAPI phone spec imports and order emails
- WhatsApp-based order confirmation for payments and customer communication

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

These are public Supabase frontend values. Do not put private service-role keys or RapidAPI keys in `.env`.

3. Run the app:

```bash
npm run dev
```

## Supabase setup

Run `supabase/migrations/001_initial_schema.sql` in your Supabase project to create the tables, RLS policies, helper admin check, categories, and brands.

The migration also creates a public Supabase Storage bucket named `product-images`. Admin users can upload product images from `/admin/products/new` and `/admin/products/:id/edit`; public users can read those images in the shop.

To use the phone import feature, deploy the Edge Function in `supabase/functions/fetch-phone-specs/index.ts`.

Checkout supports delivery to address, pickup in store, cash payment, electronic payment coordination through WhatsApp, and monthly-payment requests through WhatsApp. The store WhatsApp number used by the frontend is `+383 49 684 500`.

Run `supabase/migrations/002_order_payment_fields.sql` so orders can store WhatsApp payment provider and payment status.

Run `supabase/migrations/003_profile_checkout_fields.sql` so checkout can save customer name, phone, city, address, notes, and delivery preference for future orders.

Run `supabase/migrations/004_checkout_delivery_order_fields.sql` so orders can store pickup/delivery, installment months, estimated delivery date, warranty months, and delivery notes per order item.

To send checkout confirmation emails, deploy the Edge Function in `supabase/functions/send-order-confirmation/index.ts`. It sends the customer payment method/status, pickup or delivery choice, estimated date, ordered products, totals, monthly plan details when used, and warranty months per product.

Order emails use `send-order-confirmation` for three events:

- `placed`: sent immediately after the order is created
- `paid`: optional, if the shop manually confirms payment in a later workflow
- `shipped`: sent when an admin changes the order status to `shipped`

Add the RapidAPI key only as a Supabase Edge Function secret:

```bash
supabase secrets set RAPIDAPI_KEY=your_rapidapi_key
```

Never expose `RAPIDAPI_KEY` in frontend code and never prefix it with `VITE_`.

Add email provider secrets only to Supabase Edge Functions:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set ORDER_EMAIL_FROM="Medium Mobil Shop <orders@yourdomain.com>"
```

Never expose `RESEND_API_KEY`, `ORDER_EMAIL_FROM`, or `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

## Admin access

Admin routes use the `profiles.role` field. Set a user to admin in Supabase:

```sql
update profiles set role = 'admin' where id = 'USER_UUID';
```

Only admin users can access `/admin/*` and call the RapidAPI Edge Function.

## Netlify deploy

The `public/_redirects` file contains this SPA rewrite:

```text
/* /index.html 200
```

Keep it in the deployed build so direct links like `/admin`, `/products/iphone-15-128gb`, and refreshes on nested routes do not return a Netlify 404.

## Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview"
}
```
