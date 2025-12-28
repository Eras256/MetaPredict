import { NextRequest, NextResponse } from 'next/server';
import { reputationService } from '@/lib/services/reputationService';
import { getAuthenticatedUser } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/reputation/:userId
 * @description Get user reputation
 * Public endpoint - anyone can view reputation, but authenticated users get additional context
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: paramUserId } = await params;
    
    // Get authenticated user (optional - reputation is public)
    const auth = await getAuthenticatedUser(request);
    
    // Use authenticated userId if available, otherwise use param userId
    const finalUserId = auth.userId || paramUserId;
    
    const reputation = await reputationService.getReputation(finalUserId);
    return NextResponse.json({ 
      reputation,
      isOwnProfile: auth.isAuthenticated && auth.userId === paramUserId
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get reputation", details: error.message },
      { status: 500 }
    );
  }
}

