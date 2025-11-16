/**
 * Tests para el cliente de servicios de Gemini
 */

import {
  testGeminiConnection,
  analyzeMarket,
  suggestMarketCreation,
  analyzePortfolioRebalance,
  analyzeReputation,
  analyzeInsuranceRisk,
  analyzeDAOProposal,
  callGemini,
} from '@/lib/services/ai/gemini';

// Mock de fetch
global.fetch = jest.fn();

describe('Gemini Client Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testGeminiConnection', () => {
    it('debe hacer test de conexión exitoso', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { response: 'OK', modelUsed: 'gemini-2.5-flash' },
        }),
      });

      const result = await testGeminiConnection();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(fetch).toHaveBeenCalledWith('/api/ai/test', expect.any(Object));
    });

    it('debe manejar errores de conexión', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await testGeminiConnection();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('analyzeMarket', () => {
    it('debe analizar un mercado', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            answer: 'YES',
            confidence: 85,
            reasoning: 'Clear question',
          },
          modelUsed: 'gemini-2.5-flash',
        }),
      });

      const result = await analyzeMarket('Will Bitcoin reach $100K?');

      expect(result.success).toBe(true);
      expect(result.data?.answer).toBe('YES');
      expect(fetch).toHaveBeenCalledWith(
        '/api/ai/analyze-market',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Will Bitcoin reach $100K?'),
        })
      );
    });
  });

  describe('suggestMarketCreation', () => {
    it('debe generar sugerencias', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            suggestions: [
              {
                question: 'Test question',
                description: 'Test description',
                category: 'crypto',
              },
            ],
          },
          modelUsed: 'gemini-2.5-flash',
        }),
      });

      const result = await suggestMarketCreation('cryptocurrency');

      expect(result.success).toBe(true);
      expect(result.data?.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('analyzePortfolioRebalance', () => {
    it('debe analizar portfolio', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            riskScore: 65,
            allocations: [],
            overallRecommendation: 'Test',
            confidence: 80,
          },
          modelUsed: 'gemini-2.5-flash',
        }),
      });

      const positions = [
        {
          marketId: 1,
          question: 'Test',
          yesShares: 100,
          noShares: 0,
          totalValue: 150,
        },
      ];

      const result = await analyzePortfolioRebalance(positions);

      expect(result.success).toBe(true);
      expect(result.data?.riskScore).toBe(65);
    });
  });

  describe('analyzeReputation', () => {
    it('debe analizar reputación', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            reputationScore: 75,
            riskLevel: 'low',
            recommendations: ['Test'],
            confidence: 85,
          },
          modelUsed: 'gemini-2.5-flash',
        }),
      });

      const userData = {
        accuracy: 80,
        totalVotes: 100,
        correctVotes: 80,
        slashes: 0,
        stakes: 1000,
      };

      const result = await analyzeReputation(userData);

      expect(result.success).toBe(true);
      expect(result.data?.reputationScore).toBe(75);
    });
  });

  describe('analyzeInsuranceRisk', () => {
    it('debe analizar riesgo de insurance', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            riskScore: 45,
            recommendedCoverage: 60,
            reasoning: 'Test',
            confidence: 75,
          },
          modelUsed: 'gemini-2.5-flash',
        }),
      });

      const marketData = {
        question: 'Test',
        totalVolume: 10000,
        yesPool: 5000,
        noPool: 5000,
        resolutionTime: Date.now(),
      };

      const result = await analyzeInsuranceRisk(marketData);

      expect(result.success).toBe(true);
      expect(result.data?.riskScore).toBe(45);
    });
  });

  describe('analyzeDAOProposal', () => {
    it('debe analizar propuesta DAO', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            qualityScore: 80,
            recommendation: 'approve',
            reasoning: 'Test',
            confidence: 85,
          },
          modelUsed: 'gemini-2.5-flash',
        }),
      });

      const proposalData = {
        title: 'Test',
        description: 'Test description',
        type: 'ParameterChange',
      };

      const result = await analyzeDAOProposal(proposalData);

      expect(result.success).toBe(true);
      expect(result.data?.qualityScore).toBe(80);
    });
  });

  describe('callGemini', () => {
    it('debe hacer llamada genérica', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: 'Test response',
          modelUsed: 'gemini-2.5-flash',
        }),
      });

      const result = await callGemini('Test prompt');

      expect(result.success).toBe(true);
      expect(result.data).toBe('Test response');
    });
  });
});

