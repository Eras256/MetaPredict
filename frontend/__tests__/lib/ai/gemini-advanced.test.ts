/**
 * Tests para el helper de Gemini AI
 * Verifica que todas las funciones de IA funcionen correctamente
 */

import {
  callGemini,
  callGeminiJSON,
  analyzeMarketWithGemini,
  suggestMarketCreation,
  analyzePortfolioRebalance,
  analyzeReputation,
  analyzeInsuranceRisk,
  analyzeDAOProposal,
} from '@/lib/ai/gemini-advanced';

// Mock de GoogleGenerativeAI
jest.mock('@google/generative-ai', () => {
  const mockModel = {
    generateContent: jest.fn(),
  };

  const mockGenAI = {
    getGenerativeModel: jest.fn(() => mockModel),
  };

  return {
    GoogleGenerativeAI: jest.fn(() => mockGenAI),
  };
});

describe('Gemini AI Helper', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeAll(() => {
    // Configurar API key de prueba
    process.env.GEMINI_API_KEY = 'test-api-key-12345';
  });

  afterAll(() => {
    process.env.GEMINI_API_KEY = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('callGemini', () => {
    it('debe llamar a Gemini con el prompt correcto', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI('test-key');
      const mockModel = mockGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => 'Test response',
        },
      });

      const result = await callGemini('Test prompt');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('modelUsed');
      expect(result.data).toBe('Test response');
      expect(mockModel.generateContent).toHaveBeenCalledWith('Test prompt');
    });

    it('debe hacer fallback a otros modelos si el primero falla', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI('test-key');
      
      // Primer modelo falla
      const mockModel1 = { generateContent: jest.fn().mockRejectedValue(new Error('Model 1 failed')) };
      // Segundo modelo funciona
      const mockModel2 = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => 'Success from model 2' },
        }),
      };

      mockGenAI.getGenerativeModel
        .mockReturnValueOnce(mockModel1)
        .mockReturnValueOnce(mockModel2);

      const result = await callGemini('Test prompt');

      expect(result.data).toBe('Success from model 2');
      expect(mockModel1.generateContent).toHaveBeenCalled();
      expect(mockModel2.generateContent).toHaveBeenCalled();
    });
  });

  describe('callGeminiJSON', () => {
    it('debe extraer y parsear JSON de la respuesta', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI('test-key');
      const mockModel = mockGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => 'Here is the JSON: {"key": "value", "number": 123}',
        },
      });

      const result = await callGeminiJSON('Test prompt');

      expect(result.data).toEqual({ key: 'value', number: 123 });
      expect(result.modelUsed).toBeDefined();
    });

    it('debe manejar JSON envuelto en markdown', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI('test-key');
      const mockModel = mockGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => '```json\n{"result": "success"}\n```',
        },
      });

      const result = await callGeminiJSON('Test prompt');

      expect(result.data).toEqual({ result: 'success' });
    });
  });

  describe('analyzeMarketWithGemini', () => {
    it('debe analizar un mercado y retornar respuesta estructurada', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI('test-key');
      const mockModel = mockGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            answer: 'YES',
            confidence: 85,
            reasoning: 'The question is clear and verifiable',
          }),
        },
      });

      const result = await analyzeMarketWithGemini('Will Bitcoin reach $100K?');

      expect(result.data.answer).toBe('YES');
      expect(result.data.confidence).toBe(85);
      expect(result.data.reasoning).toBeDefined();
    });
  });

  describe('suggestMarketCreation', () => {
    it('debe generar sugerencias de mercado', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI('test-key');
      const mockModel = mockGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            suggestions: [
              {
                question: 'Will X happen?',
                description: 'Test description',
                category: 'crypto',
              },
            ],
          }),
        },
      });

      const result = await suggestMarketCreation('cryptocurrency');

      expect(result.data.suggestions).toBeInstanceOf(Array);
      expect(result.data.suggestions.length).toBeGreaterThan(0);
      expect(result.data.suggestions[0]).toHaveProperty('question');
      expect(result.data.suggestions[0]).toHaveProperty('description');
      expect(result.data.suggestions[0]).toHaveProperty('category');
    });
  });

  describe('analyzePortfolioRebalance', () => {
    it('debe analizar portfolio y sugerir rebalanceo', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI('test-key');
      const mockModel = mockGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            riskScore: 65,
            allocations: [
              {
                marketId: 1,
                recommendedAction: 'increase',
                reasoning: 'Low exposure',
              },
            ],
            overallRecommendation: 'Diversify more',
            confidence: 80,
          }),
        },
      });

      const positions = [
        {
          marketId: 1,
          question: 'Test market',
          yesShares: 100,
          noShares: 0,
          totalValue: 150,
        },
      ];

      const result = await analyzePortfolioRebalance(positions);

      expect(result.data.riskScore).toBeDefined();
      expect(result.data.allocations).toBeInstanceOf(Array);
      expect(result.data.overallRecommendation).toBeDefined();
      expect(result.data.confidence).toBeDefined();
    });
  });

  describe('analyzeReputation', () => {
    it('debe analizar reputación de usuario', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI('test-key');
      const mockModel = mockGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            reputationScore: 75,
            riskLevel: 'low',
            recommendations: ['Continue current strategy'],
            confidence: 85,
          }),
        },
      });

      const userData = {
        accuracy: 80,
        totalVotes: 100,
        correctVotes: 80,
        slashes: 0,
        stakes: 1000,
      };

      const result = await analyzeReputation(userData);

      expect(result.data.reputationScore).toBe(75);
      expect(result.data.riskLevel).toBe('low');
      expect(result.data.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('analyzeInsuranceRisk', () => {
    it('debe analizar riesgo de insurance', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI('test-key');
      const mockModel = mockGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            riskScore: 45,
            recommendedCoverage: 60,
            reasoning: 'Moderate risk market',
            confidence: 75,
          }),
        },
      });

      const marketData = {
        question: 'Test market',
        totalVolume: 10000,
        yesPool: 5000,
        noPool: 5000,
        resolutionTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };

      const result = await analyzeInsuranceRisk(marketData);

      expect(result.data.riskScore).toBe(45);
      expect(result.data.recommendedCoverage).toBe(60);
      expect(result.data.reasoning).toBeDefined();
    });
  });

  describe('analyzeDAOProposal', () => {
    it('debe analizar propuesta DAO', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI('test-key');
      const mockModel = mockGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            qualityScore: 80,
            recommendation: 'approve',
            reasoning: 'Well-structured proposal',
            confidence: 85,
          }),
        },
      });

      const proposalData = {
        title: 'Test Proposal',
        description: 'Test description',
        type: 'ParameterChange',
        proposerReputation: 75,
      };

      const result = await analyzeDAOProposal(proposalData);

      expect(result.data.qualityScore).toBe(80);
      expect(result.data.recommendation).toBe('approve');
      expect(result.data.reasoning).toBeDefined();
    });
  });
});

