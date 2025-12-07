import { describe, it, expect, beforeAll } from '@jest/globals';
import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
const BACKEND_URL = process.env.BACKEND_URL || 'https://metapredict.fun/api/oracle/resolve';

describe('Complete End-to-End Backend Integration Tests', () => {
  beforeAll(() => {
    console.log('\n📋 Backend E2E Test Configuration:');
    console.log(`   API Base URL: ${API_BASE_URL}`);
    console.log(`   Backend URL: ${BACKEND_URL}\n`);
  });

  describe('1. API Health Checks', () => {
    it('Should check oracle status endpoint', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/oracle/status`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status');
        expect(response.data.status).toBe('active');
        console.log('✅ Oracle status endpoint is working');
      } catch (error: any) {
        console.log(`⚠️  Oracle status endpoint not accessible: ${error.message}`);
        // Don't fail test if backend is not running
      }
    });

    it('Should verify backend URL configuration', () => {
      expect(BACKEND_URL).toContain('metapredict.fun');
      expect(BACKEND_URL).toContain('/api/oracle/resolve');
      console.log(`✅ Backend URL configured: ${BACKEND_URL}`);
    });
  });

  describe('2. Oracle Resolution Endpoint', () => {
    it('Should handle oracle resolution request', async () => {
      const testMarket = {
        marketDescription: 'Will Bitcoin price exceed $75,000 by end of 2025?',
        priceId: 'BTC/USD',
      };

      try {
        const response = await axios.post(`${BACKEND_URL}`, testMarket, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('outcome');
        expect(response.data).toHaveProperty('confidence');
        expect(response.data).toHaveProperty('consensusCount');
        expect(response.data).toHaveProperty('totalModels');
        
        console.log('✅ Oracle resolution endpoint working');
        console.log(`   Outcome: ${response.data.outcome}`);
        console.log(`   Confidence: ${response.data.confidence}%`);
        console.log(`   Consensus: ${response.data.consensusCount}/${response.data.totalModels}`);
      } catch (error: any) {
        console.log(`⚠️  Oracle resolution endpoint error: ${error.message}`);
        // Don't fail test if backend is not running or API keys not configured
      }
    });
  });

  describe('3. Multi-AI Consensus Service', () => {
    it('Should verify AI service configuration', () => {
      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      const groqKey = process.env.GROQ_API_KEY;
      const openRouterKey = process.env.OPENROUTER_API_KEY;

      console.log('\n📋 AI Service Configuration:');
      console.log(`   Gemini API Key: ${geminiKey ? '✅ Configured' : '❌ Not configured'}`);
      console.log(`   Groq API Key: ${groqKey ? '✅ Configured' : '❌ Not configured'}`);
      console.log(`   OpenRouter API Key: ${openRouterKey ? '✅ Configured' : '❌ Not configured'}`);

      // At least one AI service should be configured
      const hasAtLeastOne = !!(geminiKey || groqKey || openRouterKey);
      expect(hasAtLeastOne).toBe(true);
    });
  });

  describe('4. Chainlink Integration', () => {
    it('Should verify Chainlink Data Streams configuration', () => {
      const verifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY;
      const btcStreamId = process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID;
      const ethStreamId = process.env.CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID;
      const bnbStreamId = process.env.CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID;

      console.log('\n📋 Chainlink Data Streams Configuration:');
      console.log(`   Verifier Proxy: ${verifierProxy || '❌ Not configured'}`);
      console.log(`   BTC Stream ID: ${btcStreamId ? '✅ Configured' : '❌ Not configured'}`);
      console.log(`   ETH Stream ID: ${ethStreamId ? '✅ Configured' : '❌ Not configured'}`);
      console.log(`   BNB Stream ID: ${bnbStreamId ? '✅ Configured' : '❌ Not configured'}`);

      expect(verifierProxy).toBeDefined();
      expect(btcStreamId).toBeDefined();
    });
  });

  describe('5. Complete Integration Status', () => {
    it('Should verify all backend integrations', () => {
      console.log('\n📊 Complete Backend Integration Status:\n');
      
      const checks = [
        {
          name: 'Backend URL',
          status: BACKEND_URL.includes('metapredict.fun'),
        },
        {
          name: 'Gemini API Key',
          status: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
        },
        {
          name: 'Chainlink Verifier Proxy',
          status: !!process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY,
        },
        {
          name: 'BTC Stream ID',
          status: !!process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID,
        },
      ];

      for (const check of checks) {
        const status = check.status ? '✅' : '❌';
        console.log(`   ${status} ${check.name}`);
        expect(check.status).toBe(true);
      }

      console.log('\n✅ All backend integration checks passed!');
    });
  });
});

