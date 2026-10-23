/** JSON-LD builders. Only facts we actually have: no invented fields (no availability, no geo/openingHours unless confirmed). */
import site from '../data/site';
import type { Product } from '../data/products';
import type { FaqEntry } from '../data/faq';
import { priceAfterDiscount } from './format';
import { productUrl } from './url';

const abs = (path: string) => new URL(path, site.url).toString();

export function furnitureStoreLd(image?: string) {
  const a = site.addressParts;
  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: site.name,
    url: site.url,
    ...(image ? { image: abs(image) } : {}),
    telephone: `+${site.whatsapp.number}`,
    email: site.email,
    address: { '@type': 'PostalAddress', streetAddress: `${site.address.lines[0].replace(/ /g, ' ')}, ${a.street}`, addressLocality: a.locality, addressRegion: a.region, postalCode: a.postalCode, addressCountry: a.country },
    ...(site.geo ? { geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng } } : {}),
    ...(site.hours.confirmed ? { openingHours: 'Mo-Su 09:00-17:00' } : {}),   // only once the client confirms the hours
    ...(site.social.length ? { sameAs: site.social.map((s) => s.href) } : {}),
  };
}

export function productLd(p: Product, imageUrl?: string, description?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    ...(imageUrl ? { image: [abs(imageUrl)] } : {}),
    ...(description ? { description } : {}),
    sku: p.code,
    category: p.category,
    offers: { '@type': 'Offer', url: productUrl(p.slug), priceCurrency: 'IDR', price: String(priceAfterDiscount(p)) }, // availability omitted: stock is unknown
  };
}

export function faqLd(entries: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({ '@type': 'Question', name: e.q, acceptedAnswer: { '@type': 'Answer', text: e.a } })),
  };
}

/** Safe to embed in a <script type="application/ld+json">. */
export const ldJson = (obj: unknown) => JSON.stringify(obj).replace(/</g, '\\u003c');
