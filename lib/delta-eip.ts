
// Base attributes that all ESRI features should have
interface BaseESRIAttributes {
  OBJECTID: number | string;
  GlobalID?: string;
  last_updated?: string;
  created_date?: string;
  outage_start?: string;
  last_modified?: string;
  reported_date?: string;
}

// Type-specific attributes
interface LuminaireAttributes extends BaseESRIAttributes {
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'outage';
  type: string;
  wattage?: number;
  installation_date?: string;
}

interface OutageAreaAttributes extends BaseESRIAttributes {
  name: string;
  customers_affected: number;
  status: 'reported' | 'investigating' | 'repairing' | 'resolved';
  estimated_restoration?: string;
  cause?: string;
}

interface OutagePointAttributes extends BaseESRIAttributes {
  status: 'reported' | 'investigating' | 'repairing' | 'resolved';
  cause: 'equipment_failure' | 'weather' | 'accident' | 'maintenance' | 'unknown';
  reported_at: string;
  resolved_at?: string;
}

type DataType = 'luminaire' | 'outage-area' | 'outage-point';

type ESRIFeatureAttributes<T extends DataType> = 
  T extends 'luminaire' ? LuminaireAttributes :
  T extends 'outage-area' ? OutageAreaAttributes :
  T extends 'outage-point' ? OutagePointAttributes :
  never;

export interface ESRIFeature<T extends DataType = DataType> {
  attributes: ESRIFeatureAttributes<T>;
  geometry: {
    x: number;
    y: number;
  };
}

export interface EIPResponse<T extends DataType = DataType> {
  features: Array<ESRIFeature<T>>;
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
// Types for ESRI date fields by data type
type DataTypeToDateField = {
  'luminaire': 'last_updated' | 'created_date';
  'outage-area': 'outage_start' | 'last_modified';
  'outage-point': 'reported_date' | 'last_updated';
};

const DATE_FIELD_MAP: Record<keyof DataTypeToDateField, DataTypeToDateField[keyof DataTypeToDateField]> = {
  'luminaire': 'last_updated',
  'outage-area': 'last_modified',
  'outage-point': 'reported_date'
} as const;

export async function fetchDeltaEIPData<T extends DataType>(
  dataType: T,
  lastSyncTime?: string
): Promise<EIPResponse<T>> {
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
      
      const now = new Date().toISOString();
      
      // Create type-safe mock data
      const mockData = {
        'luminaire': {
          features: Array(5).fill(0).map<ESRIFeature<'luminaire'>>((_, i) => ({
            attributes: {
              OBJECTID: i + 1,
              GlobalID: `lum-${i + 1}`,
              name: `Luminaire ${i + 1}`,
              status: i % 2 === 0 ? 'active' : 'inactive',
              type: 'streetlight',
              last_updated: now,
              wattage: 150 + (i * 10)
            },
            geometry: {
              x: -0.1278 + (i * 0.01),
              y: 51.5074 + (i * 0.01)
            }
          })),
          geometryType: 'esriGeometryPoint',
          spatialReference: { wkid: 4326 }
        },
        'outage-area': {
          features: Array(3).fill(0).map<ESRIFeature<'outage-area'>>((_, i) => {
            const statuses = ['reported', 'investigating', 'repairing', 'resolved'] as const;
            const causes = ['equipment_failure', 'weather', 'accident', 'maintenance'] as const;
            
            return {
              attributes: {
                OBJECTID: i + 1,
                GlobalID: `area-${i + 1}`,
                name: `Outage Area ${i + 1}`,
                customers_affected: Math.floor(Math.random() * 100),
                status: statuses[i % 4],
                last_modified: now,
                cause: causes[i % 4]
              },
              geometry: {
                x: -0.1278 - (i * 0.02),
                y: 51.5074 + (i * 0.02)
              }
            };
          }),
          geometryType: 'esriGeometryPolygon',
          spatialReference: { wkid: 4326 }
        },
        'outage-point': {
          features: Array(4).fill(0).map<ESRIFeature<'outage-point'>>((_, i) => ({
            attributes: {
              OBJECTID: i + 1,
              GlobalID: `point-${i + 1}`,
              status: (['reported', 'investigating', 'repairing', 'resolved'] as const)[i % 4],
              cause: (['equipment_failure', 'weather', 'accident', 'maintenance'] as const)[i % 4],
              reported_at: new Date(Date.now() - (i * 3600000)).toISOString()
            },
            geometry: {
              x: -0.1278 - (i * 0.01),
              y: 51.5074 - (i * 0.01)
            }
          })),
          geometryType: 'esriGeometryPoint',
          spatialReference: { wkid: 4326 }
        }
      } as const;
      
      return mockData[dataType] as EIPResponse<T>;
    }

    // Build the where clause with lastSyncTime if provided
    const dateField = DATE_FIELD_MAP[dataType];
    let whereClause = '1=1';
    
    if (lastSyncTime && dateField) {
      // Format: "last_updated > DATE '2023-01-01'"
      const dateString = lastSyncTime.split('T')[0];
      whereClause = `${String(dateField)} > DATE '${dateString}'`;
    }

    // Compose query string
    const params = new URLSearchParams({
      where: whereClause,
      outFields: '*',
      returnGeometry: 'true',
      f: 'pjson',
      outSR: '4326', // WGS84 coordinate system
      returnDistinctValues: 'false',
      resultOffset: '0',
      resultRecordCount: '1000' // Adjust based on API limits
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
    const data = await res.json() as EIPResponse;
    
    // Log sync statistics
    if (lastSyncTime) {
      console.log(`Delta sync for ${dataType} found ${data.features?.length || 0} records updated since ${lastSyncTime}`);
    } else {
      console.log(`Initial sync for ${dataType} found ${data.features?.length || 0} records`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error in fetchDeltaEIPData (${dataType}):`, error);
    throw error;
  }
}

/**
 * Fetches a single feature by ID (simplified for PoC)
 */
type FeatureResponse<T extends keyof DataTypeToDateField> = {
  id: string | number;
  attributes: T extends 'luminaire' ? LuminaireAttributes : 
            T extends 'outage-area' ? OutageAreaAttributes :
            T extends 'outage-point' ? OutagePointAttributes : never;
  geometry: {
    x: number;
    y: number;
  };
};

export async function fetchFeatureById<T extends 'luminaire' | 'outage-area' | 'outage-point'>(
  dataType: T,
  featureId: string | number
): Promise<FeatureResponse<T>> {
  try {
    // In a real implementation, this would fetch a specific feature
    console.log(`Fetching ${dataType} with ID: ${featureId} (simulated)`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock data with proper typing
    const baseAttributes = {
      name: `Mock ${dataType} ${featureId}`,
    };

    // Type-specific attributes
    let typeSpecificAttributes;
    if (dataType === 'luminaire') {
      typeSpecificAttributes = {
        status: 'active',
        type: 'LED',
        wattage: 100,
        installation_date: new Date().toISOString()
      };
    } else if (dataType === 'outage-area') {
      typeSpecificAttributes = {
        status: 'reported',
        customers_affected: 42,
        estimated_restoration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        cause: 'equipment_failure'
      };
    } else { // outage-point
      typeSpecificAttributes = {
        status: 'reported',
        cause: 'weather_related',
        reported_at: new Date().toISOString()
      };
    }

    const mockItem: FeatureResponse<T> = {
      id: featureId,
      attributes: {
        ...baseAttributes,
        ...typeSpecificAttributes
      } as ESRIFeatureAttributes<T>, // Type assertion needed due to TypeScript limitations with conditional types
      geometry: {
        x: -122.4194,
        y: 37.7749
      }
    };

    return mockItem;

  } catch (error) {
    console.error(`Error in fetchFeatureById (${dataType}):`, error);
    throw error;
  }
}

// Process EIP data into a more usable format
export function processEIPData<T extends DataType>(
  response: EIPResponse<T>
): Array<ESRIFeatureAttributes<T> & { 
  geometry: { type: string; coordinates: [number, number] } 
}> {
  if (!response?.features) return [];
  
  return response.features.map(feature => ({
    ...feature.attributes,
    geometry: {
      type: response.geometryType?.replace('esriGeometry', '') || 'Point',
      coordinates: [feature.geometry.x, feature.geometry.y] as [number, number]
    }
  }));
}
