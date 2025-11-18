export const userService = {
  async getUserById(id: string) {
    // TODO: Implement with Prisma
    return null;
  },

  async createUser(email: string, walletAddress: string) {
    // TODO: Implement with Prisma
    return {
      id: "user-id",
      email,
      walletAddress,
      createdAt: new Date(),
    };
  },
};

