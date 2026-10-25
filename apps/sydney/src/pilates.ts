/**
 * STRONG Pilates studios in and around the explored area.
 * Source: the official studio finder feed on strongpilates.com.au, Oct 2026.
 */
export type Studio = { name: string; address: string; lat: number; lng: number };

export const studios: Studio[] = [
  {
    name: "Alexandria",
    address: "Suite 42D, 110 Bourke Rd, Alexandria",
    lat: -33.91294,
    lng: 151.19424,
  },
  { name: "Coogee", address: "116 Coogee Bay Rd, Coogee", lat: -33.91956, lng: 151.25 },
  { name: "Rozelle", address: "658 Darling St, Rozelle", lat: -33.86335, lng: 151.17072 },
  {
    name: "St Leonards",
    address: "GF Suite 1, Building A, 207 Pacific Hwy, St Leonards",
    lat: -33.82336,
    lng: 151.193,
  },
  {
    name: "Gladesville",
    address: "436–484 Victoria Rd, Gladesville",
    lat: -33.82396,
    lng: 151.12293,
  },
  { name: "Roselands", address: "920 Canterbury Rd, Roselands", lat: -33.92798, lng: 151.07948 },
  { name: "Pymble", address: "Unit 3, 25 Bridge St, Pymble", lat: -33.75063, lng: 151.14383 },
  {
    name: "Bankstown",
    address: "Shop 18, Home Focus, 173 Canterbury Rd, Bankstown",
    lat: -33.93331,
    lng: 151.02928,
  },
];

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const x = (lng2 - lng1) * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
  return Math.hypot(x, lat2 - lat1) * 111;
}

export function nearestStudio(lat: number, lng: number) {
  return studios
    .map((studio) => ({ studio, km: distanceKm(lat, lng, studio.lat, studio.lng) }))
    .sort((a, b) => a.km - b.km)[0];
}
