import { NextResponse } from 'next/server';
import { fetchDeltaEIPData, processEIPData } from '@/lib/delta-eip';
import { uploadToSitecore, getLastSyncDate, updateLastSyncDate } from '../../../lib/sitecore-upload';
import { processFeaturesToSitecoreItems } from '../../../lib/sitecore-mapper';

type EIPDataType = 'luminaire' | 'outage-area' | 'outage-point';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the last sync date
    const lastSyncDate = await getLastSyncDate();
    const results = [];
    
    // Sync data for each endpoint type
    const endpointTypes: EIPDataType[] = ['luminaire', 'outage-area', 'outage-point'];
    
    for (const type of endpointTypes) {
      try {
        // Fetch delta data from ESRI for this type
        const esriData = await fetchDeltaEIPData(type, lastSyncDate || undefined);
        
        if (!esriData.features || esriData.features.length === 0) {
          results.push({
            type,
            success: true,
            message: 'No updates since last sync',
            count: 0
          });
          continue;
        }

        // Process the data to extract features
        const processedData = processEIPData(esriData);
        
        // Map the ESRI features to Sitecore items
        const sitecoreItems = processFeaturesToSitecoreItems(
          processedData.map(item => ({
            attributes: { ...item },
            geometry: item.geometry
          })),
          type as 'luminaire' | 'outage-area' | 'outage-point'
        );
        
        // Upload to Sitecore
        const uploadResult = await uploadToSitecore(sitecoreItems);
        
        // Update last sync date if successful
        if (uploadResult.success && lastSyncDate) {
          updateLastSyncDate();
        }

        results.push({
          type,
          success: true,
          message: 'Sync completed successfully',
          count: processedData.length
        });
        
      } catch (error) {
        console.error(`Error syncing ${type} data:`, error);
        results.push({
          type,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          count: 0
        });
      }
    }

    // Check if any syncs were successful
    const anySuccess = results.some(r => r.success);
    
    return NextResponse.json({
      success: anySuccess,
      message: anySuccess ? 'Sync completed with results' : 'All syncs failed',
      results,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in sync-geojson:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
