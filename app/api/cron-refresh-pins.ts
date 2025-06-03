// /app/api/cron-refresh-pins.ts
// Vercel cron job endpoint: refreshes map pins in blob storage
import { NextResponse } from 'next/server';
import { fetchDeltaEIPData, processEIPData } from '../../lib/delta-eip';
import { saveData } from '../../lib/blob-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use 'luminaire' as the default dataType for this cron job
    const esriData = await fetchDeltaEIPData('luminaire');
    const processedData = processEIPData(esriData);
    const url = await saveData(processedData, 'pins');
    return NextResponse.json({ success: true, url });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error in cron-refresh-pins:', errMsg);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
