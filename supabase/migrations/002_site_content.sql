create table if not exists site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table site_content enable row level security;

drop policy if exists "Public read site content" on site_content;
drop policy if exists "Admin manage site content" on site_content;

create policy "Public read site content" on site_content
for select using (true);

create policy "Admin manage site content" on site_content
for all using (is_admin()) with check (is_admin());

insert into site_content (key, value)
values (
  'homepage',
  '{
    "heroBadge": "Pro. Beyond.",
    "heroTitle": "Telefona",
    "heroHighlight": "Premium",
    "heroText": "Modele flagship, aksesorë origjinalë dhe porosi e shpejtë përmes WhatsApp në Medium Mobil Shop Prizren.",
    "heroProductId": "",
    "featuredProductIds": [],
    "newArrivalProductIds": [],
    "services": [
      { "id": "service-sales", "title": "Shitje telefonash", "text": "Telefona të rinj dhe modele të kërkuara nga Apple, Samsung, Xiaomi dhe më shumë.", "icon": "smartphone", "active": true, "sort_order": 1 },
      { "id": "service-screen", "title": "Ndërrim ekrani", "text": "Zëvendësim ekrani për modele të ndryshme me kontroll teknik para dorëzimit.", "icon": "wrench", "active": true, "sort_order": 2 },
      { "id": "service-repair", "title": "Servisim", "text": "Riparim, kontroll teknik dhe ndërrim pjesësh për telefona.", "icon": "shield", "active": true, "sort_order": 3 },
      { "id": "service-accessories", "title": "Aksesorë", "text": "Mbushës, kufje, këllëfë dhe xhama mbrojtës me cilësi të garantuar.", "icon": "headphones", "active": true, "sort_order": 4 }
    ],
    "dealBanners": [
      { "id": "deal-seasonal", "title": "Oferta sezonale për telefona", "text": "Modele iPhone dhe Samsung në fokus, me çmime promocionale dhe konfirmim direkt në WhatsApp.", "cta": "Pyet për ofertat", "href": "/products", "icon": "badge", "image_url": "", "active": true, "sort_order": 1 },
      { "id": "deal-accessories", "title": "Aksesorë për çdo blerje", "text": "Mbushës, këllëfë, kufje dhe xhama mbrojtës me cilësi të garantuar për përdorim të përditshëm.", "cta": "Rezervo aksesorë", "href": "/products?category=Accessories", "icon": "plug", "image_url": "", "active": true, "sort_order": 2 },
      { "id": "deal-service", "title": "Servisim dhe dekodim", "text": "Shërbime për telefona, ndërrim ekranesh dhe ndihmë teknike në dyqan në Prizren.", "cta": "Kërko servis", "href": "#sherbime", "icon": "wrench", "image_url": "", "active": true, "sort_order": 3 }
    ],
    "specialOfferTitle": "Oferta speciale",
    "specialOfferText": "Kombino telefonin me mbushës, këllëf dhe kufje për çmim më të mirë në fund.",
    "brandFilters": ["Apple", "Samsung", "Xiaomi", "Google", "OnePlus", "Medium Mobil"]
  }'::jsonb
)
on conflict (key) do nothing;
