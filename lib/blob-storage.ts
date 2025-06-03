// lib/blob-storage.ts
import { put, del } from '@vercel/blob';

interface BlobMetadata {
  data: any[];
  lastUpdated: string;
  dataType: string;
}

/**
 * Saves data to Vercel Blob Storage
 */
export async function saveData(
  data: any[],
  dataType: string,
): Promise<string> {
  const metadata: BlobMetadata = {
    data,
    lastUpdated: new Date().toISOString(),
    dataType
  };

  const blob = await put(
    `${dataType}-${Date.now()}.json`,
    JSON.stringify(metadata),
    { access: 'public' }
  );

  return blob.url;
}

/**
 * Fetches data from Vercel Blob Storage
 */
export async function getData(url: string): Promise<BlobMetadata> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Deletes a blob from storage
 */
export async function deleteBlob(url: string): Promise<void> {
  await del(url);
}