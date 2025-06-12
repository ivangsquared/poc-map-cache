import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { parse } from "csv-parse/sync";

interface Luminaire {
  g3e_fid: string;
  globalid?: string;
  x: number;
  y: number;
  status?: string;
  style_agol?: string;
  [key: string]: unknown;
}

// In-memory cache
let cachedData: Luminaire[] | null = null;
let lastModified: Date | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

function getCacheInfo() {
  const now = new Date();
  const cacheAge = lastModified ? now.getTime() - lastModified.getTime() : null;
  const isCacheValid = cacheAge !== null && cacheAge < CACHE_TTL_MS;

  return {
    hasCachedData: cachedData !== null,
    cacheSize: cachedData ? cachedData.length : 0,
    lastModified: lastModified?.toISOString() || "Never",
    cacheAgeMs: cacheAge,
    cacheTTL: CACHE_TTL_MS,
    isCacheValid: isCacheValid,
    cacheStatus: !cachedData ? "No cache" : isCacheValid ? "Valid" : "Expired",
  };
}

async function parseCSV() {
  const csvPath = path.join(process.cwd(), "data/luminaire_locations.csv");
  console.log(`[${new Date().toISOString()}] Parsing CSV from: ${csvPath}`);

  try {
    const stats = await fs.stat(csvPath);
    const cacheInfo = getCacheInfo();

    // Check if file has been modified
    if (cacheInfo.isCacheValid && lastModified && stats.mtime <= lastModified) {
      console.log("Using cached data, file not modified");
      console.log("Cache info:", JSON.stringify(cacheInfo, null, 2));
      return { data: cachedData!, fromCache: true };
    }

    console.log(`CSV file exists, size: ${stats.size} bytes`);
    console.log(
      "Cache state before parsing:",
      JSON.stringify(cacheInfo, null, 2)
    );

    // Read and parse the file
    const fileContent = await fs.readFile(csvPath, "utf-8");
    console.log(`Read ${fileContent.length} characters from CSV`);

    // Parse CSV with headers
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      to_line: 1001, // Limit to first 1000 records for demo
    });

    console.log(`Parsed ${records.length} records from CSV`);

    // Define CSV record type
    interface CsvRecord {
      g3e_fid?: string;
      x?: string | number;
      y?: string | number;
      style_agol?: string;
      [key: string]: unknown;
    }

    // Process records
    const luminaires: Luminaire[] = records
      .filter((record: CsvRecord) => {
        const x =
          typeof record.x === "string"
            ? parseFloat(record.x)
            : Number(record.x);
        const y =
          typeof record.y === "string"
            ? parseFloat(record.y)
            : Number(record.y);
        return !isNaN(x) && !isNaN(y);
      })
      .map((record: CsvRecord) => ({
        ...record,
        g3e_fid: record.g3e_fid || "",
        x:
          typeof record.x === "string"
            ? parseFloat(record.x)
            : Number(record.x),
        y:
          typeof record.y === "string"
            ? parseFloat(record.y)
            : Number(record.y),
        style_agol: record.style_agol || "default",
      }));

    // Update cache
    cachedData = luminaires;
    lastModified = new Date();

    console.log(`Parsed ${luminaires.length} valid luminaires`);
    console.log("Updated cache info:", JSON.stringify(getCacheInfo(), null, 2));

    return { data: luminaires, fromCache: false };
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw error;
  }
}

export async function GET() {
  const requestTime = new Date();
  console.log(`[${requestTime.toISOString()}] GET /api/luminaires called`);

  try {
    const cacheInfo = getCacheInfo();
    console.log("Current cache state:", JSON.stringify(cacheInfo, null, 2));

    // Check if we have valid cached data
    if (cacheInfo.isCacheValid && cachedData) {
      console.log("Returning valid cached data");
      return NextResponse.json({
        data: cachedData,
        _metadata: {
          source: "cache",
          cacheHit: true,
          ...cacheInfo,
          processedAt: requestTime.toISOString(),
        },
      });
    }

    console.log(
      cacheInfo.cacheStatus === "Expired"
        ? "Cache expired"
        : "No valid cache available"
    );

    // If no valid cache, parse the CSV
    const { data, fromCache } = await parseCSV();

    return NextResponse.json({
      data,
      _metadata: {
        source: fromCache ? "cache" : "fresh",
        cacheHit: fromCache,
        ...getCacheInfo(),
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/luminaires:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
        _metadata: {
          error: true,
          timestamp: new Date().toISOString(),
          cacheState: getCacheInfo(),
        },
      },
      { status: 500 }
    );
  }
}
