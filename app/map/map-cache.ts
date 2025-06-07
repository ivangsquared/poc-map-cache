// map-cache.ts
// Utility for frontend map pin caching with versioning and chunk support

export interface PinChunk {
  data: { [key: string]: unknown }[];
  version: string;
  url: string;
  offset: number;
  limit: number;
  total: number;
}

const CHUNK_KEY = (offset: number, limit: number) => `cachedMapPins_${offset}_${limit}`;
const VERSION_KEY = 'cachedMapPinsVersion';
const URL_KEY = 'cachedMapPinsUrl';
const TOTAL_KEY = 'cachedMapPinsTotal';

export function savePinsChunkToCache(chunk: PinChunk) {
  localStorage.setItem(CHUNK_KEY(chunk.offset, chunk.limit), JSON.stringify(chunk.data));
  localStorage.setItem(VERSION_KEY, chunk.version);
  localStorage.setItem(URL_KEY, chunk.url);
  localStorage.setItem(TOTAL_KEY, chunk.total.toString());
}

export function loadPinsChunkFromCache(offset: number, limit: number): PinChunk | null {
  const pins = localStorage.getItem(CHUNK_KEY(offset, limit));
  const version = localStorage.getItem(VERSION_KEY);
  const url = localStorage.getItem(URL_KEY);
  const total = localStorage.getItem(TOTAL_KEY);
  if (pins && version && url && total) {
    return { data: JSON.parse(pins), version, url, offset, limit, total: parseInt(total, 10) };
  }
  return null;
}

export function clearPinsCache() {
  // Remove all chunks and metadata
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cachedMapPins_')) {
      localStorage.removeItem(key);
    }
  });
  localStorage.removeItem(VERSION_KEY);
  localStorage.removeItem(URL_KEY);
  localStorage.removeItem(TOTAL_KEY);
}
