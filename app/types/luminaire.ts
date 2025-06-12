export interface Luminaire {
  g3e_fid: string | number;
  x: number;
  y: number;
  status?: string;
  style_agol?: string;
  [key: string]: unknown;
}

export interface LuminairesResponse {
  data: Luminaire[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
  error?: string;
}

export interface MapBounds {
  _southWest: {
    lat: number;
    lng: number;
  };
  _northEast: {
    lat: number;
    lng: number;
  };
}
