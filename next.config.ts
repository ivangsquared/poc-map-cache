import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration
  webpack: (config) => {
    // This is needed for Leaflet to work with Next.js
    config.resolve.fallback = { fs: false };
    return config;
  },
  
  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: [
      'your-sitecore-instance.com',
      '*.arcgis.com',  // For ESRI assets
      '*.amazonaws.com',  // If using S3 for assets
      'tile.openstreetmap.org'  // For OpenStreetMap tiles
    ],
  },
  
  // Environment variables configuration
  env: {
    // Public variables (available on both server and client)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    NEXT_PUBLIC_MAP_TILE_URL: process.env.NEXT_PUBLIC_MAP_TILE_URL,
    
    // Server-only variables (only available in Node.js environment)
    ESRI_API_KEY: process.env.ESRI_API_KEY,
    ESRI_AUTH_TOKEN: process.env.ESRI_AUTH_TOKEN,
    ESRI_BASE_URL: process.env.ESRI_BASE_URL,
    SITECORE_ENDPOINT: process.env.SITECORE_ENDPOINT,
    SITECORE_API_KEY: process.env.SITECORE_API_KEY,
  },
  
  // Server actions configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // External packages for server components
  serverExternalPackages: ['@esri/arcgis-rest-request'],
  
  // API route configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
};

export default nextConfig;
