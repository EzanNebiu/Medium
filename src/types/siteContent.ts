export type SiteIconKey = "smartphone" | "wrench" | "shield" | "headphones" | "plug" | "badge" | "shopping";

export type SiteService = {
  id: string;
  title: string;
  text: string;
  icon: SiteIconKey;
  active: boolean;
  sort_order: number;
};

export type SiteDealBanner = {
  id: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  icon: SiteIconKey;
  image_url: string;
  active: boolean;
  sort_order: number;
};

export type HomepageContent = {
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroText: string;
  heroProductId: string;
  featuredProductIds: string[];
  newArrivalProductIds: string[];
  services: SiteService[];
  dealBanners: SiteDealBanner[];
  specialOfferTitle: string;
  specialOfferText: string;
  brandFilters: string[];
};
