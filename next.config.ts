import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure image domains
  images: {
    domains: [
      'your-sitecore-instance.com',
      '*.arcgis.com',  // For ESRI assets
      '*.amazonaws.com'  // If using S3 for assets
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
  
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Enable external packages for server components
    serverComponentsExternalPackages: ['@esri/arcgis-rest-request'],
  },
};

export default nextConfig;
