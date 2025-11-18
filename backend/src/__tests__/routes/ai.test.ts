import request from 'supertest';
import express from 'express';
import aiRouter from '../../routes/ai';
import * as geminiAdvanced from '../../lib/ai/gemini-advanced';

// Mock Gemini functions
jest.mock('../../lib/ai/gemini-advanced');

const app = express();
app.use(express.json());
app.use('/api/ai', aiRouter);

describe('AI API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/ai/test', () => {
    it('should test Gemini connection', async () => {
      const mockResponse = {
        data: '{"status": "ok", "message": "Test"}',
        modelUsed: 'gemini-2.5-flash',
      };

      (geminiAdvanced.callGemini as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).get('/api/ai/test');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/ai/analyze-market', () => {
    it('should analyze a market', async () => {
      const mockAnalysis = {
        data: { sentiment: 'positive', confidence: 85 },
        modelUsed: 'gemini-2.5-flash',
      };

      (geminiAdvanced.analyzeMarketWithGemini as jest.Mock).mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/ai/analyze-market')
        .send({ question: 'Will BTC reach $100K?' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should require question parameter', async () => {
      const response = await request(app)
        .post('/api/ai/analyze-market')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/ai/suggest-market', () => {
    it('should suggest market creation', async () => {
      const mockSuggestion = {
        data: { suggestions: ['Market 1', 'Market 2'] },
        modelUsed: 'gemini-2.5-flash',
      };

      (geminiAdvanced.suggestMarketCreation as jest.Mock).mockResolvedValue(mockSuggestion);

      const response = await request(app)
        .post('/api/ai/suggest-market')
        .send({ topic: 'crypto' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/ai/portfolio-analysis', () => {
    it('should analyze portfolio', async () => {
      const mockAnalysis = {
        data: { recommendations: [] },
        modelUsed: 'gemini-2.5-flash',
      };

      (geminiAdvanced.analyzePortfolioRebalance as jest.Mock).mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/ai/portfolio-analysis')
        .send({ positions: [] });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/ai/reputation-analysis', () => {
    it('should analyze reputation', async () => {
      const mockAnalysis = {
        data: { score: 1000 },
        modelUsed: 'gemini-2.5-flash',
      };

      (geminiAdvanced.analyzeReputation as jest.Mock).mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/ai/reputation-analysis')
        .send({ userData: {} });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/ai/insurance-risk', () => {
    it('should analyze insurance risk', async () => {
      const mockAnalysis = {
        data: { riskLevel: 'low' },
        modelUsed: 'gemini-2.5-flash',
      };

      (geminiAdvanced.analyzeInsuranceRisk as jest.Mock).mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/ai/insurance-risk')
        .send({ marketData: {} });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/ai/dao-analysis', () => {
    it('should analyze DAO proposal', async () => {
      const mockAnalysis = {
        data: { recommendation: 'approve' },
        modelUsed: 'gemini-2.5-flash',
      };

      (geminiAdvanced.analyzeDAOProposal as jest.Mock).mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/ai/dao-analysis')
        .send({ proposalData: {} });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/ai/call', () => {
    it('should make generic call to Gemini', async () => {
      const mockResponse = {
        data: 'Response',
        modelUsed: 'gemini-2.5-flash',
      };

      (geminiAdvanced.callGemini as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/ai/call')
        .send({ prompt: 'Test prompt' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });
});

