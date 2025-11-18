import { reputationService } from '../../services/reputationService';

describe('Reputation Service', () => {
  describe('getReputation', () => {
    it('should return user reputation', async () => {
      const reputation = await reputationService.getReputation('user-123');

      expect(reputation).toHaveProperty('userId');
      expect(reputation).toHaveProperty('stake');
      expect(reputation).toHaveProperty('accuracy');
      expect(reputation.userId).toBe('user-123');
    });
  });

  describe('joinDAO', () => {
    it('should join DAO', async () => {
      const result = await reputationService.joinDAO('user-123', 1.0);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('userId');
      expect(result.success).toBe(true);
    });
  });

  describe('updateReputation', () => {
    it('should update reputation when correct', async () => {
      const reputation = await reputationService.updateReputation(
        'user-123',
        true,
        100,
        85
      );

      expect(reputation).toHaveProperty('userId');
      expect(reputation).toHaveProperty('accuracy');
      expect(reputation.accuracy).toBeGreaterThan(50);
    });

    it('should update reputation when incorrect', async () => {
      const reputation = await reputationService.updateReputation(
        'user-123',
        false,
        100,
        85
      );

      expect(reputation.accuracy).toBeLessThan(50);
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard', async () => {
      const leaderboard = await reputationService.getLeaderboard();

      expect(Array.isArray(leaderboard)).toBe(true);
    });
  });
});

