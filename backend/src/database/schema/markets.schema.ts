import { z } from "zod";

export const MarketSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  category: z.enum(["sports", "politics", "crypto", "entertainment", "climate"]),
  outcome: z.enum(["binary", "conditional", "subjective"]),
  deadline: z.date(),
  volume: z.number(),
  yesPercentage: z.number().min(0).max(100),
  oracleType: z.enum(["truthchain", "polymarket", "kalshi", "azuro"]),
  createdBy: z.string(),
  status: z.enum(["pending", "active", "resolving", "resolved"]),
  resolution: z.string().nullable(),
  insuranceClaimed: z.boolean(),
  createdAt: z.date(),
});

export type Market = z.infer<typeof MarketSchema>;

