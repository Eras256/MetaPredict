import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/users/:id
 * @description Get user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await userService.getUserById(id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

