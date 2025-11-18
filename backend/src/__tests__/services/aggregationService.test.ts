import { aggregationService } from '../../services/aggregationService';

describe('Aggregation Service', () => {
  describe('getPriceComparison', () => {
    it('should compare prices across platforms', async () => {
      const comparison = await aggregationService.getPriceComparison(
        'Will BTC reach $100K?'
      );

      expect(comparison).toHaveProperty('bestOdds');
      expect(comparison).toHaveProperty('bestPlatform');
      expect(comparison).toHaveProperty('savings');
      expect(comparison).toHaveProperty('comparisons');
      expect(Array.isArray(comparison.comparisons)).toBe(true);
    });
  });

  describe('executeBestRoute', () => {
    it('should execute best route', async () => {
      const result = await aggregationService.executeBestRoute(
        'user-123',
        'Will BTC reach $100K?',
        0.1,
        true
      );

      expect(result).toHaveProperty('positionId');
      expect(result).toHaveProperty('platform');
      expect(result).toHaveProperty('amount');
      expect(result.amount).toBe(0.1);
    });
  });

  describe('getPortfolio', () => {
    it('should return user portfolio', async () => {
      const portfolio = await aggregationService.getPortfolio('user-123');

      expect(Array.isArray(portfolio)).toBe(true);
    });
  });
});

