'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { loadPinsChunkFromCache, savePinsChunkToCache, clearPinsCache } from './map-cache';


// Dynamically import the map component to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(
  () => import('../components/MapComponent'),
  { ssr: false }
);

export default function MapPage() {
  const [mapData, setMapData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(1000);
  const [total, setTotal] = useState<number | null>(null);

  const loadMapChunk = async (offsetVal: number) => {
    try {
      setIsLoading(true);
      // Try to get chunk from cache
      const cached = loadPinsChunkFromCache(offsetVal, limit);
      let chunkData = cached?.data;
      let version = cached?.version;
      let url = cached?.url;
      let totalPins = cached?.total;

      if (!chunkData || !version || !url) {
        // Fetch from API
        const response = await fetch(`/api/pins?offset=${offsetVal}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch pins chunk');
        const result = await response.json();
        chunkData = result.data;
        version = result.version;
        url = result.url;
        totalPins = result.total;
        savePinsChunkToCache({ data: chunkData, version, url, offset: offsetVal, limit, total: totalPins });
      }
      // Append or set map data
      setMapData(prev => offsetVal === 0 ? (chunkData || []) : [...prev, ...(chunkData || [])]);
      setTotal(typeof totalPins === 'number' ? totalPins : (totalPins ? parseInt(totalPins) : 0));
    } catch (err) {
      console.error('Error loading map pins chunk:', err);
      setError(err instanceof Error ? err.message : 'Failed to load map pins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMapChunk(0);
  }, []);

  if (isLoading && mapData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  const canLoadMore = total !== null && mapData.length < total;

  return (
    <div className="h-screen w-full">
      <h1 className="text-2xl font-bold p-4 bg-white shadow">EIP Map Viewer</h1>
      <div className="h-[calc(100vh-4rem)] w-full">
        <MapWithNoSSR data={mapData} />
        {canLoadMore && (
          <div className="flex justify-center my-4">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
              onClick={() => {
                setOffset(prev => {
                  const nextOffset = prev + limit;
                  loadMapChunk(nextOffset);
                  return nextOffset;
                });
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : `Load More (${mapData.length}/${total})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

