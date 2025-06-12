// lib/blob-storage.ts
import { mockBlob } from './mock-blob';
import type { BlobMetadata, BlobStorage, AccessType } from './mock-blob';

// Use mock in development, real blob in production
const isProduction = process.env.NODE_ENV === 'production';

// Type for Vercel Blob options
type VercelBlobOptions = {
  access: 'public' | 'private';
  addRandomSuffix?: boolean;
  cacheControlMaxAge?: number;
  contentType?: string;
};

// Use mock in development, real blob in production
let blob: BlobStorage;

if (isProduction) {
  // In production, use Vercel Blob with proper type handling
  const vercelBlob = await import('@vercel/blob');
  
  // Type assertion for Vercel Blob's put method
  const putBlob = async (
    pathname: string, 
    body: string, 
    options: VercelBlobOptions
  ): Promise<{ url: string }> => {
    // Vercel Blob's type definitions are more restrictive, so we need to assert the type
    const vercelOptions = {
      access: options.access as 'public', // Force to 'public' to match Vercel's type
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 7, // 1 week
      contentType: 'application/json',
    };
    const result = await vercelBlob.put(pathname, body, vercelOptions);
    return { url: result.url };
  };

  blob = {
    put: async (pathname: string, body: string, options: { access?: AccessType } = {}) => {
      const access = (options.access || 'public') as 'public' | 'private';
      return putBlob(pathname, body, { access });
    },
    get: async <T = unknown>(url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json() as BlobMetadata<T>;
      return data;
    },
    del: vercelBlob.del,
  };
} else {
  // In development, use the mock blob
  blob = mockBlob;
}

export type { BlobMetadata };

/**
 * Saves data to blob storage (mock in development, Vercel Blob in production)
 * @param data The data to save
 * @param dataType A string identifier for the type of data
 * @param options Options including access level (public/private)
 * @returns The URL of the saved blob
 */
export async function saveData<T = unknown>(
  data: T,
  dataType: string,
  options: { access?: AccessType } = {}
): Promise<string> {
  const metadata: BlobMetadata<T> = {
    data,
    lastUpdated: new Date().toISOString(),
    dataType,
    access: options.access || 'public',
  };

  const { url } = await blob.put(
    `${dataType}-${Date.now()}.json`,
    JSON.stringify(metadata),
    { access: metadata.access }
  );

  return url;
}

/**
 * Retrieves data from blob storage
 * @param url The URL of the blob to retrieve
 * @returns The blob metadata with the stored data
 */
export async function getData<T = unknown>(url: string): Promise<BlobMetadata<T>> {
  return blob.get<T>(url);
}

/**
 * Deletes a blob from storage
 * @param url The URL of the blob to delete
 */
export async function deleteBlob(url: string): Promise<void> {
  await blob.del(url);
}

/**
 * Clears all blobs (for testing/development only)
 */
export function _clearBlobStorage(): void {
  if (!isProduction && '_clear' in blob && typeof blob._clear === 'function') {
    blob._clear();
  }
}
