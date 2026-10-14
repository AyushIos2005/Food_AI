import type { CatalogFood } from '@/src/types/api';

// In-memory hand-off so /recipes/[id] can render without a single-item endpoint (none exists in the backend).
const cache = new Map<string, CatalogFood>();

export function rememberCatalogItem(item: CatalogFood) {
  cache.set(item._id, item);
}

export function getCatalogItem(id: string): CatalogFood | undefined {
  return cache.get(id);
}
