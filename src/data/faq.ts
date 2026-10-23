/**
 * FAQ — every entry renders on the site. `status: 'verify'` means the answer is PROVISIONAL, non-committal wording that
 * sends the visitor to WhatsApp. The build prints a warning listing every `verify` entry: that list is the checklist for the
 * client conversation. After confirming with FurniBLOC, edit the answer here and flip the entry to 'confirmed'.
 * Never invent prices, shipping fees, delivery areas, warranty terms or payment methods.
 * Confirmed entries come first; reorder later if you like.
 */
import site from './site';

export interface FaqEntry { q: string; a: string; status: 'confirmed' | 'verify' }

const LANDMARKS = 'Museum Radya Pustaka, Museum Keris, Museum Batik Danar Hadi, Taman Segaran, Kampung Batik Laweyan dan Kauman, Pasar Klewer, dan Pasar Gede';

export const faq: FaqEntry[] = [
  // ---------------- confirmed (sourced from the company overview / brochure, or from our own AR feature) ----------------
  {
    status: 'confirmed',
    q: 'Apa itu FurniBLOC?',
    a: `FurniBLOC adalah showroom permanen furnitur, dekorasi, dan kerajinan kualitas ekspor dari ${site.facts.tenants} tenant IKM Soloraya, di ${site.address.lines[0]}, Solo.`,
  },
  {
    status: 'confirmed',
    q: 'Di mana lokasinya?',
    a: `${site.address.oneLine}. Lokasinya dekat ${LANDMARKS}.`,
  },
  {
    status: 'confirmed',
    q: 'Apakah ada parkir dan tempat makan?',
    a: 'Ada. Area parkir luas, area kuliner di mezanin, dan lift untuk memuat barang.',
  },
  {
    status: 'confirmed',
    q: 'Produk apa saja yang ada?',
    a: 'Tiga kelompok: Furniture, Home Decoration, dan Craft. Bahannya antara lain kayu jati dan suar, rotan, bambu, tembaga, kaca artistik, dan gerabah.',
  },
  {
    status: 'confirmed',
    q: 'Bagaimana cara melihat produk dengan AR?',
    a: 'Buka halaman produk dan pilih "3D & AR". Ketuk "Lihat di ruanganmu", lalu arahkan kamera ke lantai dan letakkan produknya. Berfungsi di iPhone dan Android terbaru. Di komputer, pindai kode QR di halaman produk untuk membukanya di HP.',
  },
  {
    status: 'confirmed',
    q: 'Apakah FurniBLOC melayani kebutuhan hotel, kafe, atau kantor?',
    a: 'FurniBLOC dirancang untuk kebutuhan rumah tinggal, kafe, hotel, dan kantor. Untuk pengadaan dalam jumlah besar, tanyakan lewat WhatsApp.',
  },

  // ---------------- verify: LIVE with provisional wording. Replace after confirming with FurniBLOC. ----------------
  {
    status: 'verify', // VERIFY: hours come from a secondary source
    q: 'Jam buka FurniBLOC?',
    a: `${site.hours.label}.`,
  },
  {
    status: 'verify', // VERIFY: price policy (website vs showroom)
    q: 'Apakah harga di website sama dengan di showroom?',
    a: 'Harga di website adalah harga acuan. Harga akhir dan ketersediaan dikonfirmasi lewat WhatsApp atau langsung di showroom.',
  },
  {
    status: 'verify', // VERIFY: ordering and payment process
    q: 'Bagaimana cara pemesanan dan pembayaran?',
    a: 'Hubungi kami lewat WhatsApp dengan menyebutkan produk yang kamu minati. Tim kami akan menjelaskan cara pemesanan dan pembayaran.',
  },
  {
    status: 'verify', // VERIFY: shipping
    q: 'Apakah bisa kirim ke luar kota?',
    a: 'Pengiriman bisa dibicarakan lewat WhatsApp. Sebutkan produk dan kota tujuanmu.',
  },
  {
    status: 'verify', // VERIFY: custom orders
    q: 'Apakah bisa pesan custom?',
    a: 'Silakan tanyakan lewat WhatsApp untuk kebutuhan khusus. Tim kami akan membantu menghubungkan dengan tenant yang sesuai.',
  },
  {
    status: 'verify', // VERIFY: warranty / returns
    q: 'Bagaimana dengan garansi atau retur?',
    a: 'Ketentuan garansi dan retur bisa ditanyakan lewat WhatsApp sebelum membeli.',
  },
  {
    status: 'verify', // VERIFY: stock
    q: 'Bagaimana mengecek stok?',
    a: 'Ketersediaan stok dikonfirmasi lewat WhatsApp. Kirim nama atau kode produk.',
  },
];

// Build-time checklist: never fails the build, just prints what still needs the client's confirmation.
const pending = faq.filter((e) => e.status === 'verify');
if (pending.length) {
  console.warn(`\n[faq] ${pending.length} FAQ answer(s) are still PROVISIONAL (status: 'verify'). Confirm with FurniBLOC, then edit src/data/faq.ts:\n` +
    pending.map((e) => `  - ${e.q}`).join('\n') + '\n');
}
