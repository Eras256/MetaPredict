import request from 'supertest';
import express from 'express';
import marketsRouter from '../../routes/markets';
import { marketService } from '../../services/marketService';

// Mock the market service
jest.mock('../../services/marketService');

const app = express();
app.use(express.json());
app.use('/api/markets', marketsRouter);

describe('Markets API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/markets', () => {
    it('should return all markets', async () => {
      const mockMarkets = [
        { id: '1', description: 'Test Market 1', status: 'active' },
        { id: '2', description: 'Test Market 2', status: 'active' },
      ];

      (marketService.getAllMarkets as jest.Mock).mockResolvedValue(mockMarkets);

      const response = await request(app).get('/api/markets');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('markets');
      expect(response.body.markets).toEqual(mockMarkets);
    });

    it('should handle errors when fetching markets', async () => {
      (marketService.getAllMarkets as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/markets');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/markets/:id', () => {
    it('should return a market by ID', async () => {
      const mockMarket = {
        id: '1',
        description: 'Test Market',
        status: 'active',
      };

      (marketService.getMarketById as jest.Mock).mockResolvedValue(mockMarket);

      const response = await request(app).get('/api/markets/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('market');
      expect(response.body.market).toEqual(mockMarket);
    });

    it('should return 404 when market not found', async () => {
      (marketService.getMarketById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/markets/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/markets', () => {
    it('should create a new market', async () => {
      const marketData = {
        description: 'Will BTC reach $100K by 2025?',
        category: 'crypto',
        outcome: 'binary',
        deadline: '2025-12-31T23:59:59Z',
      };

      const mockMarket = {
        id: '1',
        ...marketData,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      (marketService.createMarket as jest.Mock).mockResolvedValue(mockMarket);

      const response = await request(app)
        .post('/api/markets')
        .send(marketData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('market');
      expect(marketService.createMarket).toHaveBeenCalledWith(
        expect.objectContaining(marketData)
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Short', // Too short
        category: 'invalid', // Invalid category
      };

      const response = await request(app)
        .post('/api/markets')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});

