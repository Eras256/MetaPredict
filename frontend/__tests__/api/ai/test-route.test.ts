/**
 * Tests para la API route de test de Gemini
 */

import { GET } from '@/app/api/ai/test/route';
import { NextRequest } from 'next/server';

// Mock del helper de Gemini
jest.mock('@/lib/ai/gemini-advanced', () => ({
  callGemini: jest.fn(),
}));

describe('GET /api/ai/test', () => {
  it('debe retornar éxito cuando Gemini funciona', async () => {
    const { callGemini } = require('@/lib/ai/gemini-advanced');
    callGemini.mockResolvedValue({
      data: '{"status": "ok", "message": "Gemini está funcionando correctamente"}',
      modelUsed: 'gemini-2.5-flash',
    });

    const request = new NextRequest('http://localhost:3000/api/ai/test', {
      method: 'GET',
    });
    const response = await GET(request);
    const responseBody = await response.text();
    const data = JSON.parse(responseBody);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.modelUsed).toBe('gemini-2.5-flash');
  });

  it('debe retornar error cuando Gemini falla', async () => {
    const { callGemini } = require('@/lib/ai/gemini-advanced');
    callGemini.mockRejectedValue(new Error('API key invalid'));

    const request = new NextRequest('http://localhost:3000/api/ai/test', {
      method: 'GET',
    });
    const response = await GET(request);
    const responseBody = await response.text();
    const data = JSON.parse(responseBody);

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});

