import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function calculateDiscount(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function safeImage(seed: string) {
  const label = seed
    .replace(/[<&>"]/g, "")
    .split(" ")
    .slice(0, 4)
    .join(" ");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <rect width="900" height="900" fill="#fff7ed"/>
      <circle cx="735" cy="150" r="115" fill="#f97316" opacity="0.18"/>
      <circle cx="160" cy="730" r="150" fill="#111827" opacity="0.08"/>
      <rect x="294" y="92" width="312" height="716" rx="56" fill="#09090b"/>
      <rect x="322" y="138" width="256" height="618" rx="34" fill="#ffffff"/>
      <rect x="392" y="117" width="116" height="16" rx="8" fill="#27272a"/>
      <rect x="356" y="192" width="188" height="188" rx="32" fill="#fed7aa"/>
      <circle cx="410" cy="258" r="42" fill="#f97316"/>
      <circle cx="486" cy="258" r="42" fill="#fb923c"/>
      <rect x="360" y="430" width="180" height="18" rx="9" fill="#111827"/>
      <rect x="360" y="470" width="130" height="14" rx="7" fill="#f97316"/>
      <text x="450" y="830" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="800" fill="#111827">${label}</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
