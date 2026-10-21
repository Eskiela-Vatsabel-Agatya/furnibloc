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
  /** Phase 2 turns on Katalog (+ AR link); Phase 3 turns on Showroom and FAQ. */
  enabled: boolean;
}

const site = {
  name: 'FurniBLOC',
  legalName: 'FURNI BLOC — Furniture & Home Decoration',
  tagline: 'Furniture & Home Decoration — showroom kolektif di Solo',
  url: 'https://www.furnibloc.com',

  address: {
    lines: [
      'Gedung Graha Wisata Niaga Lt 2',
      'Jl. Slamet Riyadi No. 275, Sriwedari, Laweyan',
      'Surakarta, Jawa Tengah 57141',
    ],
    oneLine: 'Gedung Graha Wisata Niaga Lt 2, Jl. Slamet Riyadi No. 275, Sriwedari, Laweyan, Surakarta, Jawa Tengah 57141',
  },
  /** Google Maps *search* URL built from the address. No API key. */
  get mapsUrl() {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.address.oneLine)}`;
  },

  // VERIFY: opening hours come from a secondary source in the overview docx. Confirm with the client.
  hours: { label: 'Setiap hari, 09.00–17.00 WIB' },

  // Management line (Ifah). The web-portal number 0813 9884 2698 is intentionally not used (plan A2).
  whatsapp: { number: '6285293158665', display: '0852 9315 8665' },
  email: 'Furnibloc@gmail.com',

  /** null until the client confirms a promo. Then: { text: 'Diskon hingga 25%…', until?: '2026-12-31' } */
  promo: null as null | { text: string; until?: string },

  /** Empty until URLs are supplied. */
  social: [] as { label: string; href: string }[],

  credit: { text: 'Website oleh LunAR', href: '' }, // no link until a URL is given

  brochure: '/FB.pdf', // file itself is added in Phase 3

  facts: { tenants: 30, areaM2: '1.200', opened: '25 Januari 2025' },

  nav: [
    { label: 'Katalog', href: '/#katalog', enabled: false },               // Phase 2
    { label: 'Lihat di ruanganmu (AR)', href: '/#katalog', enabled: false }, // Phase 2
    { label: 'Showroom', href: '/#showroom', enabled: false },             // Phase 3
    { label: 'FAQ', href: '/#faq', enabled: false },                       // Phase 3
  ] as NavItem[],

  // Phase 2 catalog behaviour (progressive disclosure).
  CATALOG_TOOLBAR_MIN: 6,
  CATALOG_NOTE_MAX: 4,
};

export default site;
