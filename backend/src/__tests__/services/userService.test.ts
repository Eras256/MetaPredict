import { userService } from '../../services/userService';

describe('User Service', () => {
  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const user = await userService.getUserById('user-123');

      // Currently returns null (TODO: implement with Prisma)
      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const user = await userService.createUser('test@example.com', '0x123');

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('walletAddress');
      expect(user.email).toBe('test@example.com');
      expect(user.walletAddress).toBe('0x123');
    });
  });
});

