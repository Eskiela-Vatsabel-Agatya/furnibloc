/**
 * Single source of client facts (from the company overview docx + brochure PDF).
 * Anything marked VERIFY is unconfirmed: change it here, in one line.
 *
 * Content hygiene: a DIFFERENT company called "Furnibloc" sells flat-pack furniture from Tangerang.
 * Never use its phone number (0877…), tagline, products or marketplace links.
 */
export interface NavItem {
  label: string;
  href: string;
  enabled: boolean;
}

const site = {
  name: 'FurniBLOC',
  legalName: 'FURNI BLOC — Furniture & Home Decoration',
  tagline: 'Furniture & Home Decoration — showroom kolektif di Solo',
  url: 'https://www.furnibloc.com',

  address: {
    lines: [
      'Gedung Graha Wisata Niaga Lt\u00A02',
      'Jl. Slamet Riyadi No. 275, Sriwedari, Laweyan',
      'Surakarta, Jawa Tengah 57141',
    ],
    oneLine: 'Gedung Graha Wisata Niaga Lt\u00A02, Jl. Slamet Riyadi No. 275, Sriwedari, Laweyan, Surakarta, Jawa Tengah 57141',
  },
  /** Structured parts for JSON-LD (same facts as `lines`). */
  addressParts: { street: 'Jl. Slamet Riyadi No. 275', locality: 'Surakarta', region: 'Jawa Tengah', postalCode: '57141', country: 'ID' },
  /** Google Maps *search* URL built from the address. No API key. */
  get mapsUrl() {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.address.oneLine.replace(/\u00A0/g, ' '))}`;
  },

  // VERIFY: opening hours come from a secondary source in the overview docx. Confirm with the client.
  // `confirmed` stays false until then: structured data (JSON-LD openingHours) is only emitted when it is true.
  hours: { label: 'Setiap hari, 09.00–17.00 WIB', confirmed: false },
  /** Only set when the client gives coordinates; JSON-LD omits geo while null. */
  geo: null as null | { lat: number; lng: number },

  // Management line (Ifah). The web-portal number 0813 9884 2698 is intentionally not used (plan A2).
  whatsapp: { number: '6285293158665', display: '0852 9315 8665' },
  email: 'Furnibloc@gmail.com',

  /** null until the client confirms a promo. Then: { text: 'Diskon hingga 25%…', until?: '2026-12-31' } */
  promo: null as null | { text: string; until?: string },

  /** Empty until URLs are supplied. */
  social: [] as { label: string; href: string }[],

  credit: { text: 'Website oleh LunAR', href: '' }, // no link until a URL is given

  // The brochure opens in Google's PDF viewer (human's choice). It fetches furnibloc.com/FB.pdf, so it works once
  // the domain points at this site. `brochureFile` is the old public URL that must keep working (cited in press).
  brochure: 'https://docs.google.com/viewerng/viewer?url=https://www.furnibloc.com/FB.pdf',
  brochureFile: '/FB.pdf',

  facts: { tenants: 30, areaM2: '1.200', opened: '25 Januari 2025' },

  nav: [
    { label: 'Katalog', href: '/#katalog', enabled: true },
    { label: 'Lihat di ruanganmu (AR)', href: '/#cara-ar', enabled: true },
    { label: 'Showroom', href: '/#showroom', enabled: true },
    { label: 'FAQ', href: '/#faq', enabled: true },
  ] as NavItem[],

  // Phase 2 catalog behaviour (progressive disclosure).
  CATALOG_TOOLBAR_MIN: 6,
  CATALOG_NOTE_MAX: 4,
};

export default site;
