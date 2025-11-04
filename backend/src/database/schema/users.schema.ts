import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  walletAddress: z.string(),
  embeddedWallet: z.boolean(),
  reputation: z.number().min(0).max(100),
  totalStaked: z.number(),
  totalWon: z.number(),
  totalLost: z.number(),
  freeBetsUsed: z.number().min(0).max(5),
  isPremium: z.boolean(),
  premiumExpiresAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

