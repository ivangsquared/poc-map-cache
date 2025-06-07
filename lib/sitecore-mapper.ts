import { SitecoreItem } from './sitecore-upload';

// Template IDs from Sitecore (replace with your actual template IDs)
const TEMPLATE_IDS = {
  LUMINAIRE: '{76036F5E-CBCE-46D1-AF0A-4143F9B557AA}',
  OUTAGE_AREA: '{A5A76B22-7D0F-4765-9F5B-421B931CF5EB}',
  OUTAGE_POINT: '{C5D67F2D-433E-4D8C-B362-7EBC70B21D9D}',
  DEFAULT: '{76036F5E-CBCE-46D1-AF0A-4143F9B557AA}'
} as const;

interface ESRIBaseAttributes {
  id?: string | number;
  name?: string;
  [key: string]: unknown;
}

interface ESRIFeature<T extends ESRIBaseAttributes> {
  attributes: T;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

/**
 * Maps an ESRI feature to a Sitecore item
 * @param feature The ESRI feature to map
 * @param featureType The type of feature (used to determine the template)
 * @returns A SitecoreItem ready for upload
 */
export function mapToSitecoreItem<T extends ESRIBaseAttributes>(
  feature: ESRIFeature<T>,
  featureType: 'luminaire' | 'outage-area' | 'outage-point'
): SitecoreItem {
  const { attributes, geometry } = feature;
  const { id, name, ...otherAttributes } = attributes;
  
  // Generate a unique ID if not provided
  const itemId = id ? id.toString() : `generated-${Math.random().toString(36).substr(2, 9)}`;
  
  // Get the appropriate template ID based on feature type
  const templateId = getTemplateId(featureType);
  
  // Map the geometry to a Sitecore field
  const fields: SitecoreItem['fields'] = {
    geometry: {
      value: JSON.stringify(geometry),
      type: 'text'
    }
  };

  // Map all other attributes to Sitecore fields
  Object.entries(otherAttributes).forEach(([key, value]) => {
    fields[key] = mapValueToField(value);
  });

  return {
    id: itemId,
    name: name?.toString() || `Unnamed ${featureType}`,
    templateId,
    fields
  };
}

/**
 * Maps a value to a Sitecore field
 * @param value The value to map
 * @returns A Sitecore field object
 */
function mapValueToField(value: unknown): { value: string | number | boolean | object; type: string } {
  if (value === null || value === undefined) {
    return { value: '', type: 'text' };
  }
  
  const type = typeof value;
  
  switch (type) {
    case 'string':
      return { value, type: 'text' };
    case 'number':
      return { value, type: 'number' };
    case 'boolean':
      return { value, type: 'checkbox' };
    case 'object':
      if (value === null) {
        return { value: '', type: 'text' };
      }
      if (Array.isArray(value)) {
        return { value: JSON.stringify(value), type: 'multilist' };
      }
      if (value instanceof Date) {
        return { value: value.toISOString(), type: 'date' };
      }
      return { value: JSON.stringify(value), type: 'text' };
    default:
      return { value: String(value), type: 'text' };
  }
}

/**
 * Gets the appropriate template ID for a feature type
 * @param featureType The type of feature
 * @returns The corresponding Sitecore template ID
 */
function getTemplateId(featureType: string): string {
  switch (featureType) {
    case 'luminaire':
      return TEMPLATE_IDS.LUMINAIRE;
    case 'outage-area':
      return TEMPLATE_IDS.OUTAGE_AREA;
    case 'outage-point':
      return TEMPLATE_IDS.OUTAGE_POINT;
    default:
      return TEMPLATE_IDS.DEFAULT;
  }
}

/**
 * Processes an array of ESRI features into Sitecore items
 * @param features Array of ESRI features
 * @param featureType The type of features being processed
 * @returns Array of Sitecore items
 */
export function processFeaturesToSitecoreItems<T extends ESRIBaseAttributes>(
  features: Array<ESRIFeature<T>>,
  featureType: 'luminaire' | 'outage-area' | 'outage-point'
): SitecoreItem[] {
  if (!features || !Array.isArray(features)) {
    return [];
  }
  
  return features.map(feature => 
    mapToSitecoreItem(feature, featureType)
  );
}
