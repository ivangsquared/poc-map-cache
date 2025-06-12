import { generateMockResponse } from "./mockData";

// Base attributes that all ESRI features should have
interface BaseESRIAttributes {
  objectid: number;
  globalid: string;
  last_updated?: string;
  created_date?: string;
  last_edited_date?: string;
  status?: string;
  x: number;
  y: number;
}

// Export interfaces for use in other modules
export interface LuminaireAttributes extends BaseESRIAttributes {
  location_descr?: string | null;
  state?: string | null;
  plant_number?: string | null;
  equip_number?: string | null;
  asset_num?: string | null;
  g3e_fid?: number | null;
  owned_by?: string | null;
  maintained_by?: string | null;
  style_agol: string;
  created_user?: string;
  last_edited_user?: string;
  billing_customer_name?: string | null;
  pole_num?: string | null;
  task_address?: string | null;
  incident_id: string;
  sap_tplnr?: string | null;
  tplnr?: string | null;
  sap_eqart?: string;
  control_type?: string | null;
  tariff_desc?: string | null;
  energised_date?: string | null;
  tariff_rate?: number | null;
  suburb?: string | null;
}

export interface OutageAreaAttributes extends BaseESRIAttributes {
  name: string;
  customers_affected: number;
  status: "reported" | "investigating" | "repairing" | "resolved";
  estimated_restoration?: string;
  cause?: string;
  // Add required base properties
  objectid: number;
  globalid: string;
  x: number;
  y: number;
}

export interface OutagePointAttributes extends BaseESRIAttributes {
  status: "reported" | "investigating" | "repairing" | "resolved";
  cause:
    | "equipment_failure"
    | "weather"
    | "accident"
    | "maintenance"
    | "unknown";
  reported_at: string;
  resolved_at?: string;
  // Add required base properties
  objectid: number;
  globalid: string;
  x: number;
  y: number;
}

type DataType = "luminaire" | "outage-area" | "outage-point";

type ESRIFeatureAttributes<T extends DataType> = T extends "luminaire"
  ? LuminaireAttributes
  : T extends "outage-area"
  ? OutageAreaAttributes
  : T extends "outage-point"
  ? OutagePointAttributes
  : never;

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
  luminaire: "last_edited_date" | "created_date";
  "outage-area": "outage_start" | "last_modified";
  "outage-point": "reported_date" | "last_updated";
};

const DATE_FIELD_MAP: Record<
  keyof DataTypeToDateField,
  DataTypeToDateField[keyof DataTypeToDateField]
> = {
  luminaire: "last_edited_date",
  "outage-area": "last_modified",
  "outage-point": "reported_date",
} as const;

export async function fetchDeltaEIPData<T extends DataType>(
  dataType: T,
  lastSyncTime?: string
): Promise<EIPResponse<T>> {
  try {
    // Map dataType to env URL
    const urlMap: Record<string, string | undefined> = {
      luminaire:
        process.env.EIP_LUMINAIRES_URL || "/data/luminaire_locations.csv",
      "outage-area": process.env.EIP_OUTAGE_AREAS_URL,
      "outage-point": process.env.EIP_OUTAGE_POINTS_URL,
    };
    const url = urlMap[dataType];
    const apiKey = process.env.EIP_GATEWAY_API_KEY;

    // For CSV files, we'll handle them differently
    if (url?.endsWith(".csv")) {
      try {
        // In a real implementation, you would fetch the CSV file
        // For now, we'll return an empty response as we'll handle CSV parsing in the route
        return {
          features: [],
          geometryType: "esriGeometryPoint",
          spatialReference: { wkid: 4326 },
        } as EIPResponse<T>;
      } catch (error) {
        console.error("Error reading CSV file:", error);
        throw new Error("Failed to process luminaire data");
      }
    }

    if (!url || !apiKey) {
      // Fallback to mock data if env vars are missing
      console.warn("EIP API URL or API KEY missing, using mock data.");

      const now = new Date().toISOString();

      // Create type-safe mock data that matches our actual data structure
      const mockData = {
        luminaire: {
          features: Array(5)
            .fill(0)
            .map<ESRIFeature<"luminaire">>((_, i) => {
              const baseId = 1000000 + i;
              const baseCoords = {
                x: 150.94 + i * 0.01,
                y: -33.86 + i * 0.01,
              };

              return {
                attributes: {
                  objectid: baseId,
                  globalid: `{${crypto.randomUUID()}}`,
                  status: i % 2 === 0 ? "NEW" : "REVISIT",
                  style_agol: `SL-PUB-${i % 2 === 0 ? "Pro" : "Ins"}`,
                  created_date: now,
                  last_edited_date: now,
                  created_user: "system@example.com",
                  last_edited_user: "system@example.com",
                  incident_id: `SL${String(baseId).slice(-6)}`,
                  ...baseCoords,
                  sap_eqart: "SL_LTRNSL",
                  tplnr: `SLGT00${baseId}`,
                  sap_tplnr: `SLGT00${baseId}`,
                  pole_num: `P-${10000 + i}`,
                  task_address:
                    i % 2 === 0 ? "123 Example St" : "456 Sample Rd",
                  suburb: i % 2 === 0 ? "Sydney" : "Melbourne",
                  control_type: i % 2 === 0 ? "DuskDawn" : "Photocell",
                  tariff_desc: i % 2 === 0 ? "Residential" : "Commercial",
                  tariff_rate: i % 2 === 0 ? 0.15 : 0.25,
                  energised_date: new Date(
                    Date.now() - i * 30 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                },
                geometry: baseCoords,
              };
            }),
          geometryType: "esriGeometryPoint",
          spatialReference: { wkid: 4326 },
        },
        "outage-area": {
          features: Array(3)
            .fill(0)
            .map<ESRIFeature<"outage-area">>((_, i) => {
              const statuses = [
                "reported",
                "investigating",
                "repairing",
                "resolved",
              ] as const;
              const causes = [
                "equipment_failure",
                "weather",
                "accident",
                "maintenance",
              ] as const;

              return {
                attributes: {
                  objectid: 1000 + i,
                  globalid: `{${crypto.randomUUID()}}`,
                  name: `Outage Area ${i + 1}`,
                  customers_affected: Math.floor(Math.random() * 1000),
                  status: statuses[i % statuses.length],
                  cause: causes[i % causes.length],
                  last_modified: new Date().toISOString(),
                  // Add the missing required properties
                  x: 151.2093 + (Math.random() * 0.1 - 0.05), // Random x coordinate near Sydney
                  y: -33.8688 + (Math.random() * 0.1 - 0.05), // Random y coordinate near Sydney
                },
                geometry: {
                  x: 151.2093 + (Math.random() * 0.1 - 0.05), // Should match attributes.x
                  y: -33.8688 + (Math.random() * 0.1 - 0.05), // Should match attributes.y
                },
              };
            }),
          geometryType: "esriGeometryPolygon",
          spatialReference: { wkid: 4326 },
        },
        "outage-point": {
          features: Array(4)
            .fill(0)
            .map<ESRIFeature<"outage-point">>((_, i) => ({
              attributes: {
                objectid: i + 1,
                globalid: `point-${i + 1}`,
                status: (
                  [
                    "reported",
                    "investigating",
                    "repairing",
                    "resolved",
                  ] as const
                )[i % 4],
                cause: (
                  [
                    "equipment_failure",
                    "weather",
                    "accident",
                    "maintenance",
                  ] as const
                )[i % 4],
                last_edited_date: new Date(
                  Date.now() - i * 3600000
                ).toISOString(),
                reported_at: "",
                x: 0,
                y: 0,
              },
              geometry: {
                x: -0.1278 - i * 0.01,
                y: 51.5074 - i * 0.01,
              },
            })),
          geometryType: "esriGeometryPoint",
          spatialReference: { wkid: 4326 },
        },
      } as const;

      return mockData[dataType] as EIPResponse<T>;
    }

    // Build the where clause with lastSyncTime if provided
    const dateField = DATE_FIELD_MAP[dataType];
    let whereClause = "1=1";

    if (lastSyncTime && dateField) {
      // Format: "last_updated > DATE '2023-01-01'"
      const dateString = lastSyncTime.split("T")[0];
      whereClause = `${String(dateField)} > DATE '${dateString}'`;
    }

    // Compose query string
    const params = new URLSearchParams({
      where: whereClause,
      outFields: "*",
      returnGeometry: "true",
      f: "pjson",
      outSR: "4326", // WGS84 coordinate system
      returnDistinctValues: "false",
      resultOffset: "0",
      resultRecordCount: "1000", // Adjust based on API limits
    });
    const fetchUrl = `${url}?${params.toString()}`;
    console.log("Fetching EIP data from:", fetchUrl);
    const res = await fetch(fetchUrl, {
      headers: {
        "x-Gateway-APIKey": apiKey,
        "Content-Type": "application/json",
      },
      method: "GET",
      // credentials: 'include', // add if needed
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch EIP data: ${res.status} ${res.statusText}`
      );
    }
    const data = (await res.json()) as EIPResponse;

    // Log sync statistics
    if (lastSyncTime) {
      console.log(
        `Delta sync for ${dataType} found ${
          data.features?.length || 0
        } records updated since ${lastSyncTime}`
      );
    } else {
      console.log(
        `Initial sync for ${dataType} found ${
          data.features?.length || 0
        } records`
      );
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "NETWORK_ERROR";

    // Log the full error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Full error details:", error);
    }

    try {
      // Generate mock response with proper type assertion
      const mockResponse = generateMockResponse(dataType as T);

      return {
        ...mockResponse,
        _isFallback: true,
        _error: {
          message: `Using fallback data: ${errorMessage}`,
          code: errorCode,
        },
      } as EIPResponse<T> & {
        _isFallback: boolean;
        _error: { message: string; code: string };
      };
    } catch (mockError) {
      console.error("Failed to generate mock data:", mockError);
      throw new Error(
        `Failed to fetch ${dataType} data and could not generate fallback: ${errorMessage}`
      );
    }
  }
}

type FeatureResponse<T extends DataType> = {
  id: string | number;
  attributes: T extends "luminaire"
    ? LuminaireAttributes
    : T extends "outage-area"
    ? OutageAreaAttributes
    : T extends "outage-point"
    ? OutagePointAttributes
    : never;
  geometry?: {
    x: number;
    y: number;
  };
};

export async function fetchFeatureById<T extends DataType>(
  dataType: T,
  featureId: string | number
): Promise<FeatureResponse<T>> {
  try {
    console.log(`Fetching ${dataType} with ID: ${featureId} (simulated)`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Return mock data with proper typing
    const baseAttributes = {
      name: `Mock ${dataType} ${featureId}`,
    };

    // Type-specific attributes
    let typeSpecificAttributes;
    if (dataType === "luminaire") {
      typeSpecificAttributes = {
        status: "active",
        type: "LED",
        wattage: 100,
        installation_date: new Date().toISOString(),
      };
    } else if (dataType === "outage-area") {
      typeSpecificAttributes = {
        status: "reported",
        customers_affected: 42,
        estimated_restoration: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString(),
        cause: "equipment_failure",
      };
    } else {
      // outage-point
      typeSpecificAttributes = {
        status: "reported",
        cause: "weather_related",
        reported_at: new Date().toISOString(),
      };
    }

    const mockItem: FeatureResponse<T> = {
      id: featureId,
      attributes: {
        ...baseAttributes,
        ...typeSpecificAttributes,
      } as ESRIFeatureAttributes<T>, // Type assertion needed due to TypeScript limitations with conditional types
      geometry: {
        x: -122.4194,
        y: 37.7749,
      },
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
): Array<
  ESRIFeatureAttributes<T> & {
    geometry: { type: string; coordinates: [number, number] };
  }
> {
  if (!response?.features) return [];

  return response.features.map((feature) => ({
    ...feature.attributes,
    geometry: {
      type: response.geometryType?.replace("esriGeometry", "") || "Point",
      coordinates: [feature.geometry.x, feature.geometry.y] as [number, number],
    },
  }));
}
