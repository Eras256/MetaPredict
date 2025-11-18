import request from 'supertest';
import express from 'express';
import venusRouter from '../../routes/venus';
import { venusService } from '../../services/venusService';

// Mock the venus service
jest.mock('../../services/venusService');

const app = express();
app.use(express.json());
app.use('/api/venus', venusRouter);

describe('Venus API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/venus/markets', () => {
    it('should return all markets', async () => {
      const mockMarkets = [{ address: '0x123', symbol: 'vUSDC' }];

      (venusService.getMarkets as jest.Mock).mockResolvedValue(mockMarkets);

      const response = await request(app).get('/api/venus/markets');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('markets');
    });
  });

  describe('GET /api/venus/markets/:address', () => {
    it('should return market by address', async () => {
      const mockMarket = { address: '0x123', symbol: 'vUSDC' };

      (venusService.getMarketByAddress as jest.Mock).mockResolvedValue(mockMarket);

      const response = await request(app).get('/api/venus/markets/0x123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('market');
    });

    it('should return 404 when market not found', async () => {
      (venusService.getMarketByAddress as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/venus/markets/0x999');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/venus/vusdc', () => {
    it('should return vUSDC info', async () => {
      const mockInfo = { address: '0x123', apy: 5.5 };

      (venusService.getVUSDCInfo as jest.Mock).mockResolvedValue(mockInfo);

      const response = await request(app).get('/api/venus/vusdc');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('vUSDCInfo');
    });
  });

  describe('GET /api/venus/apy/:address', () => {
    it('should return APY for vToken', async () => {
      (venusService.getVTokenAPY as jest.Mock).mockResolvedValue(5.5);

      const response = await request(app).get('/api/venus/apy/0x123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('apy');
    });
  });

  describe('GET /api/venus/insurance-pool/apy', () => {
    it('should return insurance pool APY', async () => {
      const mockAPY = { apy: 5.5, estimated: true };

      (venusService.getInsurancePoolAPY as jest.Mock).mockResolvedValue(mockAPY);

      const response = await request(app).get('/api/venus/insurance-pool/apy');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('apy');
    });
  });
});

