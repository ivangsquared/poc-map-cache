// app/api/sync/route.ts
import { NextResponse } from 'next/server';
import { DeltaUpdateManager } from '@/lib/delta-update';
import { CacheManager } from '../../../lib/cache-manager';

const deltaManager = new DeltaUpdateManager();
const cache = CacheManager.getInstance();

export async function POST(request: Request) {
  try {
    const { dataType } = await request.json();
    
    // Check cache first
    const cacheKey = `sync-${dataType}`;
    const result = await cache.getOrSet(cacheKey, async () => {
      return await deltaManager.syncWithBlobStorage(dataType);
    });
    
    return NextResponse.json({ 
      success: true, 
      metadataId: result,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}