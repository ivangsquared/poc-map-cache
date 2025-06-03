import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || `pinned-locations-${Date.now()}.json`;
    
    // Parse the request body
    const data = await request.json();
    
    // Save to Vercel Blob Storage
    const blob = await put(filename, JSON.stringify(data), {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error in blob upload:', error);
    return NextResponse.json(
      { error: 'Failed to save data to blob storage' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      );
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching blob:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from blob storage' },
      { status: 500 }
    );
  }
}
