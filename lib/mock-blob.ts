type BlobUrl = string;

export type AccessType = 'public' | 'private';

export interface BlobMetadata<T = unknown> {
  data: T;
  lastUpdated: string;
  dataType: string;
  access: AccessType;
}

export interface BlobStorage {
  put(
    pathname: string, 
    body: string, 
    options?: { access?: AccessType }
  ): Promise<{ url: string }>;
  get<T = unknown>(url: string): Promise<BlobMetadata<T>>;
  del(url: string): Promise<void>;
  _clear?: () => void; // For testing
}

class MockBlobStorage implements Omit<BlobStorage, '_clear'> {
  public store: Map<BlobUrl, BlobMetadata> = new Map();
  public urlCounter = 0;

  async put(
    pathname: string,
    body: string,
    { access = 'public' as const }: { access?: AccessType } = {}
  ): Promise<{ url: string }> {
    const url = `mock://blob/${++this.urlCounter}-${pathname}`;
    const data = JSON.parse(body);
    this.store.set(url, { 
      ...data,
      access,
      lastUpdated: new Date().toISOString() 
    });
    return { url };
  }

  async get<T = unknown>(url: string): Promise<BlobMetadata<T>> {
    const data = this.store.get(url);
    if (!data) {
      throw new Error('Blob not found');
    }
    return data as BlobMetadata<T>;
  }

  async del(url: string): Promise<void> {
    this.store.delete(url);
  }
}

const mockStorage = new MockBlobStorage();

// Simple in-memory blob storage
export const blob: BlobStorage = {
  put: mockStorage.put.bind(mockStorage),
  get: mockStorage.get.bind(mockStorage),
  del: mockStorage.del.bind(mockStorage),
  _clear: () => {
    mockStorage.store.clear();
    mockStorage.urlCounter = 0;
  }
};

export const mockBlob = mockStorage;
