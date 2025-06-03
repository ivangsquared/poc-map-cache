import { NextResponse } from 'next/server';
import { fetchDeltaEIPData, processEIPData } from '@/lib/delta-eip';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // In a real app, you would fetch from Sitecore or your database
    // For the POC, we'll use the ESRI data directly
    const esriData = await fetchDeltaEIPData('luminaire');
    const processedData = processEIPData(esriData);
    
    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error in eip-data API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch EIP data' },
      { status: 500 }
    );
  }
}
