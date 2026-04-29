import type { ProductSpecs } from "./product";

export type PhoneSearchMatch = {
  deviceId: string;
  name: string;
  brand: string;
  releaseYear?: string;
  thumbnail?: string;
  specs?: ProductSpecs;
  images?: string[];
  raw?: unknown;
};

export type ImportedPhone = {
  matches: PhoneSearchMatch[];
  message?: string;
};
