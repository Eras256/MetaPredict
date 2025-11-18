import request from 'supertest';
import express from 'express';
import oracleRouter from '../../routes/oracle';
import { ConsensusService } from '../../services/llm/consensus.service';

// Mock the consensus service
jest.mock('../../services/llm/consensus.service');

const app = express();
app.use(express.json());
app.use('/api/oracle', oracleRouter);

describe('Oracle API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/oracle/resolve', () => {
    it('should resolve a market with consensus', async () => {
      const mockConsensusResult = {
        outcome: 1, // YES
        confidence: 85,
        consensusCount: 4,
        totalModels: 5,
        votes: [
          { model: 'gemini', outcome: 1, confidence: 90 },
          { model: 'groq', outcome: 1, confidence: 85 },
        ],
      };

      const mockConsensusService = {
        getConsensus: jest.fn().mockResolvedValue(mockConsensusResult),
      };

      (ConsensusService as jest.Mock).mockImplementation(() => mockConsensusService);

      const requestBody = {
        marketDescription: 'Will BTC reach $100K by 2025?',
        priceId: '0x123',
      };

      const response = await request(app)
        .post('/api/oracle/resolve')
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('outcome');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body.outcome).toBe(1);
      expect(response.body.confidence).toBe(85);
    });

    it('should require marketDescription', async () => {
      const response = await request(app)
        .post('/api/oracle/resolve')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle consensus service errors', async () => {
      const mockConsensusService = {
        getConsensus: jest.fn().mockRejectedValue(new Error('AI service error')),
      };

      (ConsensusService as jest.Mock).mockImplementation(() => mockConsensusService);

      const response = await request(app)
        .post('/api/oracle/resolve')
        .send({ marketDescription: 'Test market' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});

