export const DEFAULT_PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#f8fafc"/>
    <g transform="translate(100, 90)">
      <rect x="20" y="30" width="160" height="130" rx="20" fill="#ffedd5" stroke="#fb923c" stroke-width="4"/>
      <circle cx="70" cy="85" r="12" fill="#ea580c"/>
      <circle cx="130" cy="85" r="12" fill="#ea580c"/>
      <path d="M85 122 Q100 135 115 122" stroke="#c2410c" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M100 10 L100 30" stroke="#fb923c" stroke-width="4" stroke-linecap="round"/>
      <circle cx="100" cy="8" r="6" fill="#f97316"/>
    </g>
    <text x="50%" y="285" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" fill="#ea580c" text-anchor="middle" letter-spacing="2">SOTOYS</text>
    <text x="50%" y="310" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94a3b8" text-anchor="middle">Foto Produk Segera Hadir</text>
  </svg>`
)}`;

export type ImageSizePreset = 'thumb' | 'card' | 'detail' | 'full';

const CLOUDINARY_TRANSFORM_PRESETS: Record<ImageSizePreset, string> = {
  thumb: 'c_limit,w_250,f_auto,q_auto',
  card: 'c_limit,w_500,f_auto,q_auto',
  detail: 'c_limit,w_900,f_auto,q_auto',
  full: 'c_limit,w_1200,f_auto,q_auto',
};

/**
 * Optimizes a Cloudinary image URL by injecting standard size and format presets
 * (f_auto, q_auto, width limits). This reduces bandwidth by up to 90% (WebP/AVIF)
 * and ensures CDN-cached delivery to minimize transformation credits.
 */
export function optimizeCloudinaryUrl(url: string, size: ImageSizePreset = 'card'): string {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  // If transformations like f_auto or w_ are already applied, don't duplicate
  if (url.includes('f_auto') || url.includes('w_') || url.includes('q_auto')) {
    return url;
  }

  const transformString = CLOUDINARY_TRANSFORM_PRESETS[size] || CLOUDINARY_TRANSFORM_PRESETS.card;
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Resolves any product image path (Cloudinary HTTPS, local uploads, or relative assets)
 * into a safe, properly-encoded URL and handles port differences and Cloudinary optimization.
 */
export function resolveProductImageUrl(url?: string | null, size: ImageSizePreset = 'card'): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_PLACEHOLDER_IMAGE;
  }

  const clean = url.trim();

  // If already placeholder SVG or data URI, return inline SVG directly
  if (clean.includes('placeholder.svg') || clean.startsWith('data:')) {
    return DEFAULT_PLACEHOLDER_IMAGE;
  }

  // If already absolute URL (Cloudinary, external CDN, blob)
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('blob:')
  ) {
    if (clean.includes('res.cloudinary.com')) {
      return optimizeCloudinaryUrl(clean, size);
    }
    return clean;
  }

  // Handle relative paths e.g. "assets/uploads/products/..." or "/assets/..."
  const normalizedPath = clean.startsWith('/') ? clean : `/${clean}`;

  // Encode each segment of path to handle spaces, parentheses and special characters
  const encodedPath = normalizedPath
    .split('/')
    .map(seg => encodeURIComponent(decodeURIComponent(seg)))
    .join('/');

  // Route to backend URL (Port 5000)
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  return `${backendBase}${encodedPath}`;
}

/**
 * Event handler for <img> onError to automatically fallback to placeholder
 * and prevent infinite broken-image loops.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src !== DEFAULT_PLACEHOLDER_IMAGE) {
    target.onerror = null; // Prevent infinite loop
    target.src = DEFAULT_PLACEHOLDER_IMAGE;
  }
}

/**
 * Frontend utility to test if an image URL is healthy/accessible.
 * Can be used in components, admin dashboard, or diagnostic tools.
 */
export function checkImageAvailability(url: string, timeoutMs: number = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) return resolve(false);

    const img = new Image();
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        img.src = '';
        resolve(false);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve(false);
      }
    };

    img.src = resolveProductImageUrl(url);
  });
}
