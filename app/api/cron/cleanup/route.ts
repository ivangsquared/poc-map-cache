// app/api/cron/cleanup/route.ts
import { NextResponse } from 'next/server';
import { enforceRetentionPolicy, checkStorageUsage } from '../../../../lib/monitoring';

export const dynamic = 'force-dynamic'; // Ensure this runs on each request

export async function GET() {
  try {
    // Check storage usage
    const usage = await checkStorageUsage();
    
    // If storage is over 70% used, enforce retention policy
    if (usage.percentageUsed > 70) {
      await enforceRetentionPolicy();
    }
    
    // Get updated usage after cleanup
    const newUsage = await checkStorageUsage();
    
    return NextResponse.json({
      success: true,
      beforeCleanup: usage,
      afterCleanup: newUsage
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}