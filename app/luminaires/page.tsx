"use client";

import { useState, useCallback } from "react";
import type { Luminaire } from "../types/luminaire";
import dynamic from "next/dynamic";
import { RefreshCw, Layers, Filter, Info } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { PageHeader } from "@/app/components/PageHeader";
import { PageFooter } from "@/app/components/PageFooter";
import { LoadingState } from "@/app/components/LoadingState";

// Dynamically import the map to avoid SSR issues
const LuminairesMap = dynamic(() => import("@/app/components/LuminairesMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      <LoadingState message="Loading map..." />
    </div>
  ),
});

export default function LuminairesPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLuminaire, setSelectedLuminaire] = useState<Luminaire | null>(
    null
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const handleLuminaireSelect = useCallback((luminaire: Luminaire) => {
    setSelectedLuminaire(luminaire);
  }, []);

  const headerActions = (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
      {/* <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button> */}
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      <PageHeader
        title="Luminaires Map"
        description="Interactive map showing luminaire locations and details"
        actions={headerActions}
      />

      <main className="flex-1 flex flex-col md:flex-row relative">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Luminaire Details
            </h2>

            {showFilters && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                      <option>All Statuses</option>
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                      <option>All Types</option>
                      <option>LED</option>
                      <option>HPS</option>
                      <option>Metal Halide</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedLuminaire ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Luminaire #{selectedLuminaire.g3e_fid}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-medium">
                      {selectedLuminaire.status || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">
                      {selectedLuminaire.style_agol || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Latitude:</span>
                    <span className="font-mono">
                      {selectedLuminaire.y?.toFixed(6) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Longitude:</span>
                    <span className="font-mono">
                      {selectedLuminaire.x?.toFixed(6) || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // Handle view details
                    }}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Layers className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>Select a luminaire to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <LuminairesMap
            className="h-full"
            onLuminaireSelect={handleLuminaireSelect}
          />
        </div>
      </main>

      <PageFooter className="border-t border-gray-200" />
    </div>
  );
}
