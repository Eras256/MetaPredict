export interface Market {
  id: string;
  description: string;
  category: "sports" | "politics" | "crypto" | "entertainment" | "climate";
  outcome: "binary" | "conditional" | "subjective";
  deadline: string;
  volume: number;
  yesPercentage: number;
  oracleType: "truthchain" | "polymarket" | "kalshi" | "azuro";
  createdBy: string;
  status: "pending" | "active" | "resolving" | "resolved";
  resolution: string | null;
  insuranceClaimed: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  walletAddress: string;
  embeddedWallet: boolean;
  reputation: number;
  totalStaked: number;
  totalWon: number;
  totalLost: number;
  freeBetsUsed: number;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReputationScore {
  userId: string;
  stake: number;
  accuracy: number;
  disputesWon: number;
  slashesIncurred: number;
  isMember: boolean;
}

