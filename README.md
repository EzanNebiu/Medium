# Medium Mobil Shop

Medium Mobil Shop is a React + Vite + TypeScript mobile phone e-commerce app with public shop pages, cart, wishlist, checkout, Supabase Auth, protected account routes, and an admin product/import workflow.

## Stack

- React + Vite + TypeScript
- Tailwind CSS with shadcn/ui-compatible component structure
- React Router DOM
- Supabase client, Auth, database tables, RLS policies
- Supabase Edge Functions for RapidAPI phone spec imports, order emails, and Stripe Checkout

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

Checkout supports delivery to address, pickup in store, cash payment, Stripe full-card payment, and Stripe monthly payment plans. To send checkout confirmation emails, deploy the Edge Function in `supabase/functions/send-order-confirmation/index.ts`. It sends the customer payment method/status, pickup or delivery choice, estimated date, ordered products, totals, monthly plan details when used, and warranty months per product.

For Stripe payments:

1. Run `supabase/migrations/002_stripe_payments.sql` in Supabase SQL Editor.
2. Deploy these Edge Functions:
   - `supabase/functions/create-stripe-checkout/index.ts`
   - `supabase/functions/stripe-webhook/index.ts`
3. Add Stripe secrets only in Supabase:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_or_live_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

4. In Stripe Dashboard, add a webhook endpoint that points to:

```text
https://YOUR_SUPABASE_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

Listen for at least:

```text
checkout.session.completed
checkout.session.expired
checkout.session.async_payment_failed
```

Do not put `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` in `.env` or any frontend code.

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

## Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview"
}
```
