/**
 * Tests para la API route de análisis de mercado
 */

import { POST } from '@/app/api/ai/analyze-market/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/ai/gemini-advanced', () => ({
  analyzeMarketWithGemini: jest.fn(),
}));

describe('POST /api/ai/analyze-market', () => {
  it('debe analizar un mercado correctamente', async () => {
    const { analyzeMarketWithGemini } = require('@/lib/ai/gemini-advanced');
    analyzeMarketWithGemini.mockResolvedValue({
      data: {
        answer: 'YES',
        confidence: 85,
        reasoning: 'Clear and verifiable question',
      },
      modelUsed: 'gemini-2.5-flash',
    });

    const request = new NextRequest('http://localhost:3000/api/ai/analyze-market', {
      method: 'POST',
      body: JSON.stringify({
        question: 'Will Bitcoin reach $100K?',
        context: 'Cryptocurrency market',
      }),
    });

    // Mock json method
    request.json = jest.fn().mockResolvedValue({
      question: 'Will Bitcoin reach $100K?',
      context: 'Cryptocurrency market',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.answer).toBe('YES');
    expect(data.data.confidence).toBe(85);
  });

  it('debe retornar error si falta question', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/analyze-market', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Mock json method
    request.json = jest.fn().mockResolvedValue({});

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('question is required');
  });
});

