import { NextRequest, NextResponse } from 'next/server';
import { aggregationService } from '@/lib/services/aggregationService';
import { getAuthenticatedUser } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/aggregation/portfolio/:userId
 * @description Get user portfolio across all platforms
 * Requires authentication - users can only access their own portfolio
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: paramUserId } = await params;
    
    // Get authenticated user
    const auth = await getAuthenticatedUser(request);
    
    // Verify user can only access their own portfolio
    if (auth.isAuthenticated && auth.userId !== paramUserId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only access your own portfolio" },
        { status: 403 }
      );
    }
    
    // If not authenticated, use param userId (for backward compatibility)
    const finalUserId = auth.userId || paramUserId;
    
    const portfolio = await aggregationService.getPortfolio(finalUserId);
    return NextResponse.json({ portfolio });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get portfolio", details: error.message },
      { status: 500 }
    );
  }
}

