import request from 'supertest';
import express from 'express';
import reputationRouter from '../../routes/reputation';
import { reputationService } from '../../services/reputationService';

// Mock the reputation service
jest.mock('../../services/reputationService');

const app = express();
app.use(express.json());
app.use('/api/reputation', reputationRouter);

describe('Reputation API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reputation/:userId', () => {
    it('should return user reputation', async () => {
      const mockReputation = {
        userId: 'user-123',
        reputationScore: 1000,
        tier: 2,
        stakedAmount: '1.0',
      };

      (reputationService.getReputation as jest.Mock).mockResolvedValue(mockReputation);

      const response = await request(app).get('/api/reputation/user-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reputation');
      expect(response.body.reputation).toEqual(mockReputation);
    });

    it('should handle errors when fetching reputation', async () => {
      (reputationService.getReputation as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app).get('/api/reputation/user-123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/reputation/join', () => {
    it('should join DAO', async () => {
      const mockResult = {
        success: true,
        transactionHash: '0x123',
      };

      (reputationService.joinDAO as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/reputation/join')
        .send({ userId: 'user-123', stakeAmount: '1.0' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result');
      expect(reputationService.joinDAO).toHaveBeenCalledWith('user-123', '1.0');
    });

    it('should handle errors when joining DAO', async () => {
      (reputationService.joinDAO as jest.Mock).mockRejectedValue(
        new Error('Join failed')
      );

      const response = await request(app)
        .post('/api/reputation/join')
        .send({ userId: 'user-123', stakeAmount: '1.0' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/reputation/update', () => {
    it('should update reputation', async () => {
      const mockReputation = {
        userId: 'user-123',
        reputationScore: 1100,
        tier: 2,
      };

      (reputationService.updateReputation as jest.Mock).mockResolvedValue(mockReputation);

      const response = await request(app)
        .post('/api/reputation/update')
        .send({
          userId: 'user-123',
          wasCorrect: true,
          marketSize: '100',
          confidence: 85,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reputation');
    });
  });

  describe('GET /api/reputation/leaderboard', () => {
    it('should return leaderboard', async () => {
      const mockLeaderboard = [
        { userId: 'user-1', reputationScore: 2000, tier: 3 },
        { userId: 'user-2', reputationScore: 1500, tier: 2 },
      ];

      (reputationService.getLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard);

      const response = await request(app).get('/api/reputation/leaderboard');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('leaderboard');
      expect(response.body.leaderboard).toEqual(mockLeaderboard);
    });
  });
});

