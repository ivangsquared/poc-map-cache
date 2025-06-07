import { NextResponse } from 'next/server';
import { getData, saveData } from '../../../lib/blob-storage';
import { fetchDeltaEIPData, processEIPData } from '../../../lib/delta-eip';

/**
 * GET: Serves the latest pins data from blob storage, or fetches fresh if requested.
 * Query params:
 *   - fresh: if 'true', forces a new fetch from EIP and updates blob storage
 *   - url: blob storage URL to fetch from (optional, defaults to latest)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get('fresh') === 'true';
    const blobUrl = searchParams.get('url');
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    let pinsData = [];
    let version = '';
    let url = '';

    if (forceFresh || !blobUrl) {
      // Fetch fresh data from EIP (using 'luminaire' as example type)
      const esriData = await fetchDeltaEIPData('luminaire');
      const processedData = processEIPData(esriData);
      // Save to blob storage
      url = await saveData(processedData, 'pins');
      pinsData = processedData;
      version = new Date().toISOString();
    } else {
      // Fetch from blob storage
      const blob = await getData(blobUrl);
      pinsData = blob.data;
      version = blob.lastUpdated;
      url = blobUrl;
    }

    // Chunking/pagination
    const total = pinsData.length;
    const pagedData = pinsData.slice(offset, offset + limit);
    return NextResponse.json({ version, url, data: pagedData, total, offset, limit });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error in pins API:', errMsg);
    return NextResponse.json(
      { error: 'Failed to serve pins data', details: errMsg },
      { status: 500 }
    );
  }
}


/**
 * POST: Allows manual update of pins data (optional for admin use)
 * Body: { data: [...], dataType: 'pins' }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, dataType = 'pins' } = body;
    const url = await saveData(data, dataType);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error in pins POST:', error);
    return NextResponse.json(
      { error: 'Failed to save pins data' },
      { status: 500 }
    );
  }
}
