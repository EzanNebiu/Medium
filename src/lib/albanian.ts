import type { ProductCondition, ProductSpecs } from "../types/product";

const categoryMap: Record<string, string> = {
  iPhone: "iPhone",
  "Samsung Galaxy": "Samsung Galaxy",
  Xiaomi: "Xiaomi",
  "Google Pixel": "Google Pixel",
  OnePlus: "OnePlus",
  Accessories: "Aksesorë",
  Chargers: "Mbushës",
  Cases: "Këllëfë",
  Earbuds: "Kufje",
  Smartwatches: "Ora inteligjente",
};

const availabilityMap: Record<string, string> = {
  "in-stock": "Në stok",
  "low-stock": "Pak në stok",
  "out-of-stock": "Nuk ka stok",
};

const conditionMap: Record<ProductCondition, string> = {
  new: "I ri",
  "open-box": "Paketim i hapur",
  refurbished: "I rinovuar",
};

const deliveryMap: Record<string, string> = {
  "24h delivery": "Dërgesë 24h",
  "Fast delivery": "Dërgesë e shpejtë",
  "Pre-order": "Porosi paraprake",
};

export function sqCategory(value: string) {
  return categoryMap[value] ?? value;
}

export function sqAvailability(value: string) {
  return availabilityMap[value] ?? value;
}

export function sqCondition(value: ProductCondition | string) {
  return conditionMap[value as ProductCondition] ?? value;
}

export function sqDelivery(value: string) {
  return deliveryMap[value] ?? translateToAlbanian(value);
}

export function sqPayment(value: string) {
  if (value === "cash") return "Pagesë me para në dorë";
  if (value === "electronic-full" || value === "bank" || value === "card") return "Pagesë elektronike e plotë";
  if (value === "monthly") return "Pagesë mujore";
  return translateToAlbanian(value);
}

export function sqDeliveryMethod(value: string) {
  if (value === "pickup") return "Marrje në dyqan";
  if (value === "delivery") return "Dërgesë në adresë";
  return translateToAlbanian(value);
}

export function translateSpecsToAlbanian(specs: ProductSpecs): ProductSpecs {
  return {
    ...specs,
    display: translateToAlbanian(specs.display),
    processor: translateToAlbanian(specs.processor),
    ram: translateToAlbanian(specs.ram),
    storage: translateToAlbanian(specs.storage),
    rear_camera: translateToAlbanian(specs.rear_camera),
    front_camera: translateToAlbanian(specs.front_camera),
    battery: translateToAlbanian(specs.battery),
    charging: translateToAlbanian(specs.charging),
    operating_system: translateToAlbanian(specs.operating_system),
    network: translateToAlbanian(specs.network),
    sim: translateToAlbanian(specs.sim),
    dimensions: translateToAlbanian(specs.dimensions),
    weight: translateToAlbanian(specs.weight),
    colors: translateToAlbanian(specs.colors),
    release_date: translateToAlbanian(specs.release_date),
  };
}

export function translateToAlbanian(value: string) {
  if (!value) return value;
  const replacements: Array<[RegExp, string]> = [
    [/\bFast delivery\b/gi, "Dërgesë e shpejtë"],
    [/\b24h delivery\b/gi, "Dërgesë 24h"],
    [/\bWarranty\b/gi, "Garanci"],
    [/\bofficial warranty\b/gi, "garanci zyrtare"],
    [/\bOriginal products\b/gi, "Produkte origjinale"],
    [/\bSecure checkout\b/gi, "Pagesë e sigurt"],
    [/\bCustomer support\b/gi, "Mbështetje për klientë"],
    [/\bDisplay\b/gi, "Ekran"],
    [/\bScreen\b/gi, "Ekran"],
    [/\bProcessor\b/gi, "Procesor"],
    [/\bChipset\b/gi, "Çipset"],
    [/\bRear camera\b/gi, "Kamera e pasme"],
    [/\bFront camera\b/gi, "Kamera e përparme"],
    [/\bSelfie camera\b/gi, "Kamera selfie"],
    [/\bBattery\b/gi, "Bateri"],
    [/\bCharging\b/gi, "Mbushje"],
    [/\bOperating system\b/gi, "Sistem operativ"],
    [/\bNetwork\b/gi, "Rrjet"],
    [/\bDimensions\b/gi, "Dimensione"],
    [/\bWeight\b/gi, "Peshë"],
    [/\bColors\b/gi, "Ngjyra"],
    [/\bRelease date\b/gi, "Data e lansimit"],
    [/\bAll-day battery\b/gi, "Bateri për gjithë ditën"],
    [/\bfast charging\b/gi, "mbushje e shpejtë"],
    [/\bwireless charging\b/gi, "mbushje pa kabllo"],
    [/\bLatest mobile OS\b/gi, "Sistemi më i ri mobil"],
    [/\bBlack\b/gi, "E zezë"],
    [/\bWhite\b/gi, "E bardhë"],
    [/\bBlue\b/gi, "E kaltër"],
    [/\bSilver\b/gi, "E argjendtë"],
    [/\bGreen\b/gi, "E gjelbër"],
    [/\bPink\b/gi, "Rozë"],
    [/\bGray\b/gi, "Gri"],
    [/\bTitanium\b/gi, "Titan"],
    [/\bClear\b/gi, "Transparente"],
  ];
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}
