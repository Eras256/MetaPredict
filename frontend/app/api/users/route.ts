import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 30;

const createUserSchema = z.object({
  email: z.string().email(),
  walletAddress: z.string().startsWith("0x").length(42),
});

/**
 * POST /api/users
 * @description Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, walletAddress } = createUserSchema.parse(body);
    
    const user = await userService.createUser(email, walletAddress);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

