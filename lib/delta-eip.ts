
export interface ESRIFeature {
  attributes: Record<string, any>;
  geometry: {
    x: number;
    y: number;
  };
}

export interface EIPResponse {
  features: ESRIFeature[];
  geometryType?: string;
  spatialReference?: {
    wkid?: number;
    latestWkid?: number;
  };
  fields?: Array<{
    name: string;
    type: string;
    alias?: string;
  }>;
  exceededTransferLimit?: boolean;
}


/**
 * Fetches data from ESRI EIP
 */
export async function fetchDeltaEIPData(
  dataType: 'luminaire' | 'outage-area' | 'outage-point',
  lastSyncTime?: string
): Promise<any> {
  try {
    // Map dataType to env URL
    const urlMap: Record<string, string | undefined> = {
      'luminaire': process.env.EIP_LUMINAIRES_URL,
      'outage-area': process.env.EIP_OUTAGE_AREAS_URL,
      'outage-point': process.env.EIP_OUTAGE_POINTS_URL,
    };
    const url = urlMap[dataType];
    const apiKey = process.env.EIP_GATEWAY_API_KEY;

    if (!url || !apiKey) {
      // Fallback to mock data if env vars are missing
      console.warn('EIP API URL or API KEY missing, using mock data.');
      const mockData: Record<string, any[]> = {
        'luminaire': Array(5).fill(0).map((_, i) => ({
          id: `lum-${i + 1}`,
          name: `Luminaire ${i + 1}`,
          status: i % 2 === 0 ? 'active' : 'inactive',
          lastUpdated: new Date().toISOString(),
          location: { lat: 51.5074 + (i * 0.01), lng: -0.1278 + (i * 0.01) }
        })),
        'outage-area': Array(3).fill(0).map((_, i) => ({
          id: `area-${i + 1}`,
          name: `Outage Area ${i + 1}`,
          customersAffected: Math.floor(Math.random() * 100),
          lastUpdated: new Date().toISOString(),
          geometry: { type: 'Polygon', coordinates: [] }
        })),
        'outage-point': Array(4).fill(0).map((_, i) => ({
          id: `point-${i + 1}`,
          status: ['reported', 'investigating', 'repairing', 'resolved'][i % 4],
          cause: ['equipment_failure', 'weather', 'accident', 'maintenance'][i % 4],
          location: { 
            lat: 51.5074 + (i * 0.02), 
            lng: -0.1278 - (i * 0.02) 
          },
          lastUpdated: new Date().toISOString()
        }))
      };
      return mockData[dataType] || [];
    }

    // Compose query string (add more params as needed)
    const params = new URLSearchParams({
      where: '1=1',
      outFields: '*',
      returnGeometry: 'true',
      f: 'pjson'
    });
    const fetchUrl = `${url}?${params.toString()}`;
    console.log('Fetching EIP data from:', fetchUrl);
    const res = await fetch(fetchUrl, {
      headers: {
        'x-Gateway-APIKey': apiKey,
        'Content-Type': 'application/json',
      },
      method: 'GET',
      // credentials: 'include', // add if needed
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch EIP data: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error in fetchDeltaEIPData (${dataType}):`, error);
    throw error;
  }
}

/**
 * Fetches a single feature by ID (simplified for PoC)
 */
export async function fetchFeatureById(
  dataType: 'luminaire' | 'outage-area' | 'outage-point',
  featureId: string | number
): Promise<any> {
  try {
    // In a real implementation, this would fetch a specific feature
    console.log(`Fetching ${dataType} with ID: ${featureId} (simulated)`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock data
    const mockItem = {
      id: featureId,
      name: `Sample ${dataType} ${featureId}`,
      status: 'active',
      lastUpdated: new Date().toISOString(),
      // Add type-specific fields
      ...(dataType === 'luminaire' && { 
        type: 'streetlight',
        wattage: 150,
        location: { lat: 51.5074, lng: -0.1278 }
      }),
      ...(dataType === 'outage-area' && { 
        customersAffected: 25,
        estimatedRestoration: new Date(Date.now() + 3600000).toISOString()
      }),
      ...(dataType === 'outage-point' && { 
        cause: 'equipment_failure',
        location: { lat: 51.5074, lng: -0.1278 }
      })
    };

    return mockItem;

  } catch (error) {
    console.error(`Error in fetchFeatureById (${dataType}):`, error);
    throw error;
  }
}

// Process EIP data into a more usable format
export function processEIPData(data: any): any[] {
  if (!data?.features) return [];
  
  return data.features.map((feature: any) => ({
    ...feature.attributes,
    geometry: {
      type: 'Point',
      coordinates: [feature.geometry.x, feature.geometry.y]
    },
    lastUpdated: new Date().toISOString(),
    type: 'luminaire' // Default type, can be overridden
  }));
}
