"use client";

import { LuminaireAttributes } from "@/lib/delta-eip";
import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState<LuminaireAttributes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [dataType, setDataType] = useState<
    "luminaire" | "outage-area" | "outage-point"
  >("luminaire");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/pins?type=${dataType}&offset=0&limit=1000`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setData(result.data); // Adjust if your API response uses a different structure
      setLastSync(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataType]);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          ESRI Data Sync PoC
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <label
                htmlFor="dataType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Data Type
              </label>
              <select
                id="dataType"
                value={dataType}
                onChange={(e) =>
                  setDataType(
                    e.target.value as
                      | "luminaire"
                      | "outage-area"
                      | "outage-point"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="luminaire">Luminaire</option>
                <option value="outage-area">Outage Area</option>
                <option value="outage-point">Outage Point</option>
              </select>
            </div>

            <div className="flex items-end gap-3">
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh Data
                  </>
                )}
              </button>

              <div className="text-sm text-gray-500">
                {lastSync
                  ? `Last synced: ${lastSync.toLocaleTimeString()}`
                  : "Not synced yet"}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">
              Data Preview
            </h2>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading data...</p>
              </div>
            ) : data.length > 0 ? (
              <div className="overflow-x-auto overflow-y-scroll h-[400px]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(data[0]).map((key) => (
                        <th
                          key={key}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.entries(item).map(([key, value]) => (
                          <td
                            key={key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {typeof value === "object"
                              ? JSON.stringify(value).substring(0, 50) + "..."
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available. Click &quot;Refresh Data&quot; to fetch from
                the API.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Storage Usage
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: "0%" }}
            ></div>
          </div>
          <div className="text-sm text-gray-500">0 MB of 5 GB used</div>
        </div>
      </div>
    </main>
  );
}
