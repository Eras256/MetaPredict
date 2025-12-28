const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const userService = {
  async getUserById(id: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error('[UserService] Error fetching user:', error);
      return null;
    }
  },

  async getUserByWalletAddress(walletAddress: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/wallet/${walletAddress}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error('[UserService] Error fetching user by wallet:', error);
      return null;
    }
  },

  async createUser(email: string, walletAddress: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          email,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.user || {
        id: "user-id",
        email,
        walletAddress,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('[UserService] Error creating user:', error);
      throw error;
    }
  },
};

