import {
  EIPResponse,
  OutageAreaAttributes,
  OutagePointAttributes,
} from "./delta-eip";

const SYDNEY_COORDS = { x: 151.2093, y: -33.8688 };

function generateMockLuminaireResponse(): EIPResponse<"luminaire"> {
  const now = new Date().toISOString();
  const statuses = ["ACTIVE", "INACTIVE", "MAINTENANCE"] as const;

  return {
    features: Array(50)
      .fill(0)
      .map((_, i) => ({
        attributes: {
          objectid: i + 1,
          globalid: `{${crypto.randomUUID?.() || `mock-guid-${i}`}}`,
          style_agol: i % 2 === 0 ? "LED" : "SODIUM",
          status: statuses[i % statuses.length],
          incident_id: `INC-${1000 + i}`,
          pole_num: `POLE-${1000 + i}`,
          task_address: `${100 + i} Mock Street, Sydney`,
          suburb: ["Sydney", "Parramatta", "Chatswood", "Bondi", "Manly"][
            i % 5
          ],
          control_type: ["AUTO", "MANUAL", "TIMER"][i % 3],
          tariff_desc: i % 2 === 0 ? "Residential" : "Commercial",
          tariff_rate: i % 2 === 0 ? 0.15 : 0.25,
          energised_date: now,
          x: SYDNEY_COORDS.x + (Math.random() * 0.1 - 0.05),
          y: SYDNEY_COORDS.y + (Math.random() * 0.1 - 0.05),
        },
        geometry: {
          x: SYDNEY_COORDS.x + (Math.random() * 0.1 - 0.05),
          y: SYDNEY_COORDS.y + (Math.random() * 0.1 - 0.05),
        },
      })),
    geometryType: "esriGeometryPoint",
    spatialReference: { wkid: 4326 },
  };
}

function generateMockOutageAreaResponse(): EIPResponse<"outage-area"> {
  const statuses: Array<OutageAreaAttributes["status"]> = [
    "reported",
    "investigating",
    "repairing",
    "resolved",
  ];
  const causes = [
    "equipment_failure",
    "weather",
    "accident",
    "maintenance",
  ] as const;
  const now = new Date().toISOString();

  return {
    features: Array(5)
      .fill(0)
      .map((_, i) => ({
        attributes: {
          objectid: 1000 + i,
          globalid: `{${crypto.randomUUID?.() || `mock-guid-area-${i}`}}`,
          name: `Outage Area ${i + 1}`,
          customers_affected: Math.floor(Math.random() * 1000),
          status: statuses[i % statuses.length],
          cause: causes[i % causes.length],
          last_modified: now,
          x: SYDNEY_COORDS.x + (Math.random() * 0.1 - 0.05),
          y: SYDNEY_COORDS.y + (Math.random() * 0.1 - 0.05),
        },
        geometry: {
          x: SYDNEY_COORDS.x + (Math.random() * 0.1 - 0.05),
          y: SYDNEY_COORDS.y + (Math.random() * 0.1 - 0.05),
        },
      })),
    geometryType: "esriGeometryPoint",
    spatialReference: { wkid: 4326 },
  };
}

function generateMockOutagePointResponse(): EIPResponse<"outage-point"> {
  const statuses: Array<OutagePointAttributes["status"]> = [
    "reported",
    "investigating",
    "repairing",
    "resolved",
  ];
  const causes = [
    "equipment_failure",
    "weather",
    "accident",
    "maintenance",
    "unknown",
  ] as const;
  const now = new Date().toISOString();

  return {
    features: Array(20)
      .fill(0)
      .map((_, i) => ({
        attributes: {
          objectid: 2000 + i,
          globalid: `{${crypto.randomUUID?.() || `mock-guid-point-${i}`}}`,
          status: statuses[i % statuses.length],
          cause: causes[i % causes.length],
          reported_at: now,
          resolved_at: i % 3 === 0 ? now : undefined,
          x: SYDNEY_COORDS.x + (Math.random() * 0.1 - 0.05),
          y: SYDNEY_COORDS.y + (Math.random() * 0.1 - 0.05),
        },
        geometry: {
          x: SYDNEY_COORDS.x + (Math.random() * 0.1 - 0.05),
          y: SYDNEY_COORDS.y + (Math.random() * 0.1 - 0.05),
        },
      })),
    geometryType: "esriGeometryPoint",
    spatialReference: { wkid: 4326 },
  };
}

export function generateMockResponse<
  T extends "luminaire" | "outage-area" | "outage-point"
>(dataType: T): EIPResponse<T> {
  switch (dataType) {
    case "luminaire":
      return generateMockLuminaireResponse() as EIPResponse<T>;
    case "outage-area":
      return generateMockOutageAreaResponse() as EIPResponse<T>;
    case "outage-point":
      return generateMockOutagePointResponse() as EIPResponse<T>;
    default:
      throw new Error(`Unsupported data type: ${String(dataType)}`);
  }
}
