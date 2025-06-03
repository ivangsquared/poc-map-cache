# ESRI Delta Data Sync PoC

This project is a Proof of Concept (PoC) for synchronizing delta data between ESRI's GIS services and Sitecore XM Cloud. It provides a Next.js application with API endpoints to fetch, process, and sync geospatial data from ESRI's REST APIs to Sitecore's content management system.

## 🚀 Features

- **Multi-endpoint Support**: Fetches data from multiple ESRI endpoints:
  - Luminaire positions
  - Outage areas
  - Outage points
- **Delta Sync**: Only fetches and processes data that has changed since the last sync
- **TypeScript Support**: Full type safety throughout the application
- **Environment-based Configuration**: Secure handling of API keys and endpoints
- **Automated Testing**: Includes test scripts for verifying API connectivity

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Mapping**: (Pluggable, currently placeholder) - easily integrates with Leaflet, Mapbox, or other JS map libraries
- **API**: Next.js API Routes
- **TypeScript**: For type safety
- **Environment Management**: dotenv for local development
- **Testing**: Built-in test scripts for API verification

## 📁 Project Structure

```
arcgis-sitecore-poc/
├── app/
│   ├── api/
│   │   ├── sync/                # Delta sync API with Sitecore
│   │   ├── sync-geojson/        # Delta sync API for EIP/ESRI GeoJSON
│   │   ├── pins/                # Map pins API
│   │   └── ...
│   ├── map/
│   │   ├── page.tsx             # Map viewer page
│   │   └── map-cache.ts         # Frontend cache utilities
│   ├── components/
│   │   └── MapComponent.tsx     # Map rendering component (placeholder)
│   ├── layout.tsx, page.tsx     # App shell and landing page
│   └── ...
├── lib/
│   ├── delta-eip.ts             # EIP/ESRI API client and processors
│   ├── delta-update.ts          # Delta update manager
│   ├── sitecore-upload.ts       # Sitecore integration stubs
│   ├── cache-manager.ts         # In-memory cache manager
│   ├── monitoring.ts            # Blob storage monitoring utils
│   └── blob-storage.ts          # Vercel blob storage integration
├── public/                      # Static assets
├── .env.local                   # Environment config (not committed)
├── README.md
└── ...
```

## ✅ What This PoC Proves

- **Integration**: Demonstrates fetching, processing, and syncing geospatial data from EIP/ESRI APIs to a headless CMS (Sitecore) using a modern Next.js stack.
- **Delta Sync**: Only new or changed data since last sync is fetched and processed, reducing unnecessary transfers.
- **Extensibility**: Easily add new data types, endpoints, or map libraries.
- **Security**: Sensitive credentials are kept out of the codebase using environment variables.
- **Frontend/Backend Separation**: The API layer can be consumed by any frontend, not just the included Next.js pages.
- **Testing/Mocking**: Falls back to mock data if environment variables are missing, so you can test the UI/API without live endpoints.

---

## 📦 Prerequisites

- Node.js 18+
- npm or yarn
- ESRI API credentials
- Sitecore XM Cloud instance (for full integration)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd arcgis-sitecore-poc
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # EIP/ESRI API Configuration
   EIP_LUMINAIRES_URL=https://eip-test-apigw.dev.eeaus.com/eip-gateway/luminaires-position/v1/position
   EIP_OUTAGE_AREAS_URL=https://eip-test-apigw.dev.eeaus.com/gateway/arcgis-cnsoutage-areas/v1/areas
   EIP_OUTAGE_POINTS_URL=https://eip-test-apigw.dev.eeaus.com/gateway/arcgis-cnsoutage-points/v1/points
   EIP_GATEWAY_API_KEY=your_eip_gateway_api_key

   # Sitecore Configuration (optional for full integration)
   SITECORE_ENDPOINT=your_sitecore_endpoint
   SITECORE_API_KEY=your_sitecore_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Test the API and Frontend**
   - Open your browser or use a tool like Postman to call:
     ```
     http://localhost:3000/api/sync-geojson
     ```
   - You should see a JSON response with sync results for each data type.
   - Navigate to `/map` in your browser to test the frontend map viewer.

---

## 🧪 Testing

- You can test the API endpoints directly via browser or Postman.
- You can also test the UI by navigating to the `/map` route in your running app.

---

## 🔄 Data Flow

1. **Fetch Data**
   - The system fetches data from EIP/ESRI APIs using the URLs and API key in `.env.local`.
   - Only retrieves records modified since the last sync (if implemented).

2. **Process Data**
   - Transforms raw ESRI features into a standardized format.
   - Adds type-specific metadata.

3. **Upload to Sitecore**
   - Sends processed data to Sitecore XM Cloud (if configured).
   - Updates the last sync timestamp.


## 📝 License

This project is proprietary and confidential.

