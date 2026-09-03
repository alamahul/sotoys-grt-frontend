import { Product } from '../types';

export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'sotoys_search_history',
  POPULAR_SEARCHES: 'sotoys_popular_searches',
  CHECKOUT_KEYWORDS: 'sotoys_checkout_keywords',
};

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export interface PopularSearchItem {
  query: string;
  count: number;
}

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getSearchHistory(): SearchHistoryItem[] {
  const items: SearchHistoryItem[] = safeGetItem<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
  return items
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
}

export function addToSearchHistory(query: string): void {
  const items: SearchHistoryItem[] = safeGetItem<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
  const trimmed = query.trim();
  if (!trimmed) return;

  const filtered = items.filter(item => item.query !== trimmed);
  filtered.push({ query: trimmed, timestamp: Date.now() });

  safeSetItem(STORAGE_KEYS.SEARCH_HISTORY, filtered.slice(0, 20));
}

export function getPopularSearches(): PopularSearchItem[] {
  const items: PopularSearchItem[] = safeGetItem<PopularSearchItem[]>(STORAGE_KEYS.POPULAR_SEARCHES, []);
  return items
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function incrementPopularSearch(query: string): void {
  const items: PopularSearchItem[] = safeGetItem<PopularSearchItem[]>(STORAGE_KEYS.POPULAR_SEARCHES, []);
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return;

  const existing = items.find(item => item.query === trimmed);
  if (existing) {
    existing.count += 1;
  } else {
    items.push({ query: trimmed, count: 1 });
  }

  safeSetItem(STORAGE_KEYS.POPULAR_SEARCHES, items.slice(0, 50));
}

export function getCheckoutKeywords(): string[] {
  const keywords: string[] = safeGetItem<string[]>(STORAGE_KEYS.CHECKOUT_KEYWORDS, []);
  return keywords.slice(0, 15);
}

export function addCheckoutKeywords(keywords: string[]): void {
  const existing: string[] = safeGetItem<string[]>(STORAGE_KEYS.CHECKOUT_KEYWORDS, []);
  const trimmed = keywords.map(k => k.trim()).filter(Boolean);

  for (const keyword of trimmed) {
    const lower = keyword.toLowerCase();
    if (!existing.some(existing => existing.toLowerCase() === lower)) {
      existing.push(keyword);
    }
  }

  safeSetItem(STORAGE_KEYS.CHECKOUT_KEYWORDS, existing.slice(0, 50));
}

export function getRelatedProducts(query: string, products: Product[], limit = 12): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const words = q.split(/\s+/).filter(w => w.length >= 3);

  const scored = products.map(product => {
    const name = product.name.toLowerCase();
    const categoryId = product.categoryId.toLowerCase();
    let score = 0;

    if (name === q) {
      score += 100;
    } else if (name.includes(q)) {
      score += 50;
    }

    for (const word of words) {
      if (name.includes(word)) {
        score += 10;
      }
    }

    return { product, score };
  });

  const matched = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);

  return matched;
}
