import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Types for Sitecore item
export interface SitecoreItem {
  id: string;
  name: string;
  templateId: string;
  fields: Record<string, {
    value: string | number | boolean | object;
    type: string;
  }>;
}

// Types for upload result
export interface UploadResult {
  success: boolean;
  message?: string;
  itemsProcessed?: number;
  errors?: Array<{ itemId: string; error: string }>;
}

// Path for storing sync state
const SYNC_STATE_DIR = join(process.cwd(), '.sync');
const SYNC_STATE_FILE = join(SYNC_STATE_DIR, 'last-sync.json');

// Ensure sync directory exists
function ensureSyncDir(): void {
  if (!existsSync(SYNC_STATE_DIR)) {
    mkdirSync(SYNC_STATE_DIR, { recursive: true });
  }
}

/**
 * Uploads data to Sitecore
 * @param data Array of items to upload
 * @returns Upload result with status and details
 */
export async function uploadToSitecore(data: SitecoreItem[]): Promise<UploadResult> {
  if (!data || data.length === 0) {
    return {
      success: true,
      message: 'No data to upload',
      itemsProcessed: 0
    };
  }

  try {
    // In a real implementation, this would make an API call to Sitecore
    // For POC, we'll simulate the upload with a delay
    await new Promise<void>((resolve) => {
      console.log(`Uploading ${data.length} items to Sitecore...`);
      setTimeout(resolve, 300);
    });

    // Log successful upload
    console.log(`Successfully uploaded ${data.length} items to Sitecore`);
    
    return {
      success: true,
      itemsProcessed: data.length,
      message: `Successfully processed ${data.length} items`
    };
  } catch (error) {
    console.error('Error uploading to Sitecore:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during upload',
      errors: [{
        itemId: 'batch',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]
    };
  }
}

/**
 * Gets the last sync date from persistent storage
 * @returns ISO string of last sync date or null if never synced
 */
export async function getLastSyncDate(): Promise<string | null> {
  try {
    ensureSyncDir();
    
    if (!existsSync(SYNC_STATE_FILE)) {
      return null;
    }
    
    const data = await readFile(SYNC_STATE_FILE, 'utf-8');
    const { lastSyncDate } = JSON.parse(data);
    return lastSyncDate || null;
  } catch (error) {
    console.error('Error reading last sync date:', error);
    return null;
  }
}

/**
 * Updates the last sync date in persistent storage
 * @param date Optional date to set (defaults to current time)
 */
export async function updateLastSyncDate(date: Date = new Date()): Promise<void> {
  try {
    ensureSyncDir();
    const lastSyncDate = date.toISOString();
    await writeFile(
      SYNC_STATE_FILE,
      JSON.stringify({ lastSyncDate }, null, 2),
      'utf-8'
    );
    console.log(`Updated last sync date to: ${lastSyncDate}`);
  } catch (error) {
    console.error('Error updating last sync date:', error);
    throw new Error('Failed to update last sync date');
  }
}
