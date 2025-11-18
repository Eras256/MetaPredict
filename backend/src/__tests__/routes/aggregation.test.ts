import request from 'supertest';
import express from 'express';
import aggregationRouter from '../../routes/aggregation';
import { aggregationService } from '../../services/aggregationService';

// Mock the aggregation service
jest.mock('../../services/aggregationService');

const app = express();
app.use(express.json());
app.use('/api/aggregation', aggregationRouter);

describe('Aggregation API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/aggregation/compare', () => {
    it('should compare prices', async () => {
      const mockComparison = {
        bestChain: 'opBNB',
        bestPrice: 0.52,
        savings: 0.03,
      };

      (aggregationService.getPriceComparison as jest.Mock).mockResolvedValue(mockComparison);

      const response = await request(app)
        .post('/api/aggregation/compare')
        .send({ marketDescription: 'Will BTC reach $100K?' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('comparison');
      expect(response.body.comparison).toEqual(mockComparison);
    });

    it('should handle errors when comparing prices', async () => {
      (aggregationService.getPriceComparison as jest.Mock).mockRejectedValue(
        new Error('Comparison failed')
      );

      const response = await request(app)
        .post('/api/aggregation/compare')
        .send({ marketDescription: 'Test' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/aggregation/execute', () => {
    it('should execute best route', async () => {
      const mockResult = {
        success: true,
        transactionHash: '0x123',
        chain: 'opBNB',
      };

      (aggregationService.executeBestRoute as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/aggregation/execute')
        .send({
          userId: 'user-123',
          marketDescription: 'Will BTC reach $100K?',
          betAmount: '0.1',
          isYes: true,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result');
    });
  });

  describe('GET /api/aggregation/portfolio/:userId', () => {
    it('should return user portfolio', async () => {
      const mockPortfolio = {
        totalBets: 10,
        totalWinnings: '5.0',
        activeMarkets: 3,
      };

      (aggregationService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

      const response = await request(app).get('/api/aggregation/portfolio/user-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('portfolio');
      expect(response.body.portfolio).toEqual(mockPortfolio);
    });
  });
});

