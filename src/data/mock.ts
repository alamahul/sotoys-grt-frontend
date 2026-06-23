import { Product, Category, Variation, VariationOption } from '../types';
import rawProducts from './mock_products_local_images.json';

// ──────────────────────────────────────────────
// Categories (grouped & simplified from Shopee)
// ──────────────────────────────────────────────
export const mockCategories: Category[] = [
  { id: 'cat-slime',       name: 'Slime & Squishy' },
  { id: 'cat-kendaraan',   name: 'Mainan Kendaraan' },
  { id: 'cat-gasing',      name: 'Gasing & Spinner' },
  { id: 'cat-balok',       name: 'Balok & Brick' },
  { id: 'cat-boneka',      name: 'Boneka & Figure' },
  { id: 'cat-edukasi',     name: 'Mainan Edukasi' },
  { id: 'cat-air-outdoor', name: 'Air & Outdoor' },
  { id: 'cat-kartu',       name: 'Kartu & Board Game' },
  { id: 'cat-aksesoris',   name: 'Kaos Kaki & Aksesoris' },
  { id: 'cat-mainan-lain', name: 'Mainan Lainnya' },
  { id: 'cat-stationery',  name: 'Stationery & Perlengkapan' },
  { id: 'cat-pesta',       name: 'Perlengkapan Pesta' },
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function getCategoryId(categoryStr: string): string {
  const s = categoryStr.toLowerCase();

  // ── Slime & Squishy ──
  if (s.includes('slime') || s.includes('squishy')) return 'cat-slime';

  // ── Mainan Kendaraan ──
  if (
    s.includes('vehicle') || s.includes('kendaraan') ||
    s.includes('mobil') || s.includes('toy vehicle') ||
    s.includes('pullback') || s.includes('hotweel') ||
    s.includes('bus') || s.includes('tayo')
  ) return 'cat-kendaraan';

  // ── Gasing & Spinner ──
  if (
    s.includes('spinning') || s.includes('spinner') ||
    s.includes('gangsing') || s.includes('gasing') ||
    s.includes('yo-yo') || s.includes('yoyo') ||
    s.includes('spinning tops')
  ) return 'cat-gasing';

  // ── Balok & Brick ──
  if (
    s.includes('block') || s.includes('balok') ||
    s.includes('brick') || s.includes('magnetic')
  ) return 'cat-balok';

  // ── Boneka & Figure ──
  if (
    s.includes('doll') || s.includes('boneka') ||
    s.includes('stuffed') || s.includes('plush') ||
    s.includes('action figure') || s.includes('figure') ||
    s.includes('blind box') || s.includes('naruto') ||
    s.includes('anime') || s.includes('dragon') ||
    s.includes('robot toys') || s.includes('transformer')
  ) return 'cat-boneka';

  // ── Kartu & Board Game ──
  if (
    s.includes('kartu') || s.includes('card') ||
    s.includes('board') || s.includes('dice') ||
    s.includes('board game') || s.includes('ludo') ||
    s.includes('tangram') || s.includes('sudoku') ||
    s.includes('trivia')
  ) return 'cat-kartu';

  // ── Air & Outdoor ──
  if (
    s.includes('water') || s.includes('air') || s.includes('pool') ||
    s.includes('semprotan') || s.includes('pistol') ||
    s.includes('suntikan') || s.includes('watergun') ||
    s.includes('kite') || s.includes('baling') ||
    s.includes('wind spinner') || s.includes('flying') ||
    s.includes('balloon') || s.includes('balon') ||
    s.includes('kelereng') || s.includes('basket') ||
    s.includes('sport') || s.includes('handband') ||
    s.includes('bath toys') || s.includes('pool, water')
  ) return 'cat-air-outdoor';

  // ── Kaos Kaki & Aksesoris ──
  if (
    s.includes('sock') || s.includes('kaki') ||
    s.includes('kaos kaki') || s.includes('accessories') ||
    s.includes('fashion') || s.includes('muslim') ||
    s.includes('keychain') || s.includes('gantungan') ||
    s.includes('fridge magnet') || s.includes('souvenir') ||
    s.includes('nail') || s.includes('kutek') ||
    s.includes('beauty') || s.includes('makeup') ||
    s.includes('bag')
  ) return 'cat-aksesoris';

  // ── Stationery & Perlengkapan ──
  if (
    s.includes('stationery') || s.includes('notebook') ||
    s.includes('sticker') || s.includes('stiker') ||
    s.includes('label') || s.includes('art supply') ||
    s.includes('sketch') || s.includes('eraser') ||
    s.includes('memo') || s.includes('sticky note') ||
    s.includes('ruler') || s.includes('protractor') ||
    s.includes('stencil') || s.includes('writing board') ||
    s.includes('gift & wrapping') || s.includes('bubble')
  ) return 'cat-stationery';

  // ── Perlengkapan Pesta ──
  if (
    s.includes('party') || s.includes('pesta') ||
    s.includes('balloon') || s.includes('topeng') ||
    s.includes('clown') || s.includes('mask')
  ) return 'cat-pesta';

  // ── Mainan Edukasi (catch remaining educational) ──
  if (
    s.includes('educational') || s.includes('edukasi') ||
    s.includes('puzzle') || s.includes('poster') ||
    s.includes('painting') || s.includes('gypsum') ||
    s.includes('clay') || s.includes('musical') ||
    s.includes('terompet') || s.includes('pancing') ||
    s.includes('mancing') || s.includes('chemistry') ||
    s.includes('telescope') || s.includes('solar') ||
    s.includes('coding') || s.includes('anatomy') ||
    s.includes('dinosaur') || s.includes('dig kit') ||
    s.includes('letter') || s.includes('number') ||
    s.includes('magic toy') || s.includes('prank') ||
    s.includes('pretend play') || s.includes('uang uangan') ||
    s.includes('mainan edukasi')
  ) return 'cat-edukasi';

  // ── Remaining / catch-all ──
  return 'cat-mainan-lain';
}

function generateDescription(name: string, category: string): string {
  if (category.includes('Slime')) return 'Mainan slime berkualitas dengan tekstur lembut dan warna menarik. Cocok untuk bermain dan mengatasi stres.';
  if (category.includes('Kendaraan')) return 'Mainan kendaraan mini yang seru dan kolektibel. Cocok untuk anak-anak maupun kolektor.';
  if (category.includes('Gasing')) return 'Mainan gasing dan spinner yang seru untuk dimainkan sendiri maupun diadu dengan teman.';
  if (category.includes('Balok')) return 'Mainan balok dan brick bangunan untuk merangsang kreativitas dan imajinasi anak.';
  if (category.includes('Boneka')) return 'Koleksi boneka dan figure karakter favorit dengan detail menarik dan kualitas premium.';
  if (category.includes('Edukasi')) return 'Mainan edukatif yang membantu perkembangan otak dan kreativitas anak. Belajar sambil bermain!';
  if (category.includes('Air')) return 'Mainan air dan outdoor yang seru untuk bermain di luar ruangan bersama teman-teman.';
  if (category.includes('Kartu')) return 'Kartu dan board game seru untuk dimainkan bersama keluarga dan teman.';
  if (category.includes('Aksesoris')) return 'Aksesoris fashion berkualitas dengan desain menarik dan nyaman dipakai sehari-hari.';
  if (category.includes('Stationery')) return 'Perlengkapan stationery dan alat tulis berkualitas untuk kebutuhan sehari-hari.';
  if (category.includes('Pesta')) return 'Perlengkapan pesta lengkap untuk membuat acara semakin meriah.';
  return 'Produk berkualitas dengan harga terjangkau. Cocok untuk kebutuhan sehari-hari.';
}

function generateSku(index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const cat = letters[index % 26];
  return `SKU-${cat}${String(index + 1).padStart(4, '0')}`;
}

/** Convert a relative image path to an absolute /assets/ path */
function toAbsolutePath(p: string): string {
  if (!p) return '';
  // Remove leading 'assets/' if present to avoid duplicate
  const cleanPath = p.replace(/^assets\//, '');
  return `/assets/${cleanPath}`;
}

// ──────────────────────────────────────────────
// Transform raw JSON → Product[]
// ──────────────────────────────────────────────
export const mockProducts: Product[] = (rawProducts as any[]).map((item, index) => {
  // Collect all images: cover first, then ps_item_images
  // Convert relative paths (./assets/...) to absolute (/assets/...)
  const images: string[] = [];
  if (item.ps_item_cover_image) {
    images.push(toAbsolutePath(item.ps_item_cover_image));
  }
  if (item.ps_item_images && Array.isArray(item.ps_item_images)) {
    item.ps_item_images.forEach((img: string) => {
      if (img) {
        const absPath = toAbsolutePath(img);
        if (!images.includes(absPath)) {
          images.push(absPath);
        }
      }
    });
  }

  // Map category
  const categoryId = getCategoryId(item.et_title_product_category || '');
  const categoryName = mockCategories.find(c => c.id === categoryId)?.name || 'Mainan Lainnya';

  // Generate description from name & category
  const description = generateDescription(item.et_title_product_name, categoryName);

  // Process variations if they exist
  let variations: Variation[] | undefined;
  if (item.variations && Array.isArray(item.variations) && item.variations.length > 0) {
    variations = item.variations.map((v: any) => ({
      variation_type: v.variation_type || '',
      variation_options: (v.variation_options || []).map((opt: any) => ({
        name: opt.name || '',
        image: opt.image ? toAbsolutePath(opt.image) : null
      }))
    }));
  }

  return {
    id: `p${index + 1}`,
    sku: item.et_title_parent_sku || generateSku(index),
    name: item.et_title_product_name || 'Produk Tanpa Nama',
    description,
    price: item.price || 0,
    stock: item.stock || 0,
    rating: Math.floor(Math.random() * 3) + 3 as (3 | 4 | 5), // 3-5
    categoryId,
    reviews: [] as unknown as [userName: string, userImage: string, rating: number, comment: string, createdAt: Date],
    images: images.length > 0 ? images : ['/assets/uploads/products/placeholder.svg'],
    variations,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});