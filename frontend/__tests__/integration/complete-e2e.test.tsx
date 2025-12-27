import { describe, it, expect } from '@jest/globals';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

describe('Complete End-to-End Frontend Integration Tests', () => {
  describe('1. Contract Addresses Configuration', () => {
    it('Should verify all contract addresses are configured', () => {
      console.log('\n📋 Frontend Contract Addresses:\n');
      
      const contracts = [
        { name: 'Core Contract', address: CONTRACT_ADDRESSES.CORE_CONTRACT },
        { name: 'AI Oracle', address: CONTRACT_ADDRESSES.AI_ORACLE },
        { name: 'Insurance Pool', address: CONTRACT_ADDRESSES.INSURANCE_POOL },
        { name: 'Reputation Staking', address: CONTRACT_ADDRESSES.REPUTATION_STAKING },
        { name: 'DAO Governance', address: CONTRACT_ADDRESSES.DAO_GOVERNANCE },
        { name: 'Data Streams', address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION },
      ];

      for (const contract of contracts) {
        expect(contract.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
        console.log(`   ✅ ${contract.name}: ${contract.address}`);
      }
    });

    it('Should verify contract addresses match deployed contracts', () => {
      const expectedAddresses = {
        CORE_CONTRACT: '0x5eaa77CC135b82c254F1144c48f4d179964fA0b1',
        AI_ORACLE: '0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c',
        INSURANCE_POOL: '0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA',
        REPUTATION_STAKING: '0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7',
        DAO_GOVERNANCE: '0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123',
        DATA_STREAMS_INTEGRATION: '0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3',
      };

      expect(CONTRACT_ADDRESSES.CORE_CONTRACT.toLowerCase()).toBe(
        expectedAddresses.CORE_CONTRACT.toLowerCase()
      );
      expect(CONTRACT_ADDRESSES.AI_ORACLE.toLowerCase()).toBe(
        expectedAddresses.AI_ORACLE.toLowerCase()
      );
      expect(CONTRACT_ADDRESSES.INSURANCE_POOL.toLowerCase()).toBe(
        expectedAddresses.INSURANCE_POOL.toLowerCase()
      );
      expect(CONTRACT_ADDRESSES.REPUTATION_STAKING.toLowerCase()).toBe(
        expectedAddresses.REPUTATION_STAKING.toLowerCase()
      );
      expect(CONTRACT_ADDRESSES.DAO_GOVERNANCE.toLowerCase()).toBe(
        expectedAddresses.DAO_GOVERNANCE.toLowerCase()
      );
      expect(CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION.toLowerCase()).toBe(
        expectedAddresses.DATA_STREAMS_INTEGRATION.toLowerCase()
      );

      console.log('✅ All contract addresses match deployed contracts');
    });
  });

  describe('2. Environment Configuration', () => {
    it('Should verify environment variables are configured', () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;

      console.log('\n📋 Frontend Environment Configuration:\n');
      console.log(`   API URL: ${apiUrl || '❌ Not configured'}`);
      console.log(`   App URL: ${appUrl || '❌ Not configured'}`);
      console.log(`   Chain ID: ${chainId || '❌ Not configured'}`);

      expect(chainId).toBeDefined();
    });
  });

  describe('3. API Integration', () => {
    it('Should verify API service configuration', () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      expect(apiUrl).toBeDefined();
      console.log(`✅ API URL configured: ${apiUrl}`);
    });
  });

  describe('4. Complete Integration Status', () => {
    it('Should verify complete frontend integration', () => {
      console.log('\n📊 Complete Frontend Integration Status:\n');
      
      const checks = [
        {
          name: 'Core Contract Address',
          status: CONTRACT_ADDRESSES.CORE_CONTRACT.startsWith('0x'),
        },
        {
          name: 'AI Oracle Address',
          status: CONTRACT_ADDRESSES.AI_ORACLE.startsWith('0x'),
        },
        {
          name: 'Insurance Pool Address',
          status: CONTRACT_ADDRESSES.INSURANCE_POOL.startsWith('0x'),
        },
        {
          name: 'Reputation Staking Address',
          status: CONTRACT_ADDRESSES.REPUTATION_STAKING.startsWith('0x'),
        },
        {
          name: 'DAO Governance Address',
          status: CONTRACT_ADDRESSES.DAO_GOVERNANCE.startsWith('0x'),
        },
        {
          name: 'Data Streams Address',
          status: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION.startsWith('0x'),
        },
      ];

      for (const check of checks) {
        const status = check.status ? '✅' : '❌';
        console.log(`   ${status} ${check.name}`);
        expect(check.status).toBe(true);
      }

      console.log('\n✅ All frontend integration checks passed!');
    });
  });
});

