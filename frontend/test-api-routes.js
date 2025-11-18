/**
 * Test script for all migrated API routes
 * Run with: node frontend/test-api-routes.js
 * 
 * Make sure the Next.js dev server is running: pnpm dev
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function testRoute(method, path, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log(`${colors.blue}🧪 Testing MetaPredict API Routes${colors.reset}\n`);
  console.log(`Base URL: ${BASE_URL}\n`);

  const tests = [
    // Venus Routes
    { name: 'Venus - Markets', method: 'GET', path: '/api/venus/markets' },
    { name: 'Venus - vUSDC Info', method: 'GET', path: '/api/venus/vusdc' },
    { name: 'Venus - Insurance Pool APY', method: 'GET', path: '/api/venus/insurance-pool/apy' },
    
    // Gelato Routes
    { name: 'Gelato - Status', method: 'GET', path: '/api/gelato/status' },
    { name: 'Gelato - Bot Status', method: 'GET', path: '/api/gelato/bot-status' },
    
    // Oracle Routes
    { name: 'Oracle - Status', method: 'GET', path: '/api/oracle/status' },
    
    // Markets Routes
    { name: 'Markets - List', method: 'GET', path: '/api/markets' },
    
    // Reputation Routes
    { name: 'Reputation - Leaderboard', method: 'GET', path: '/api/reputation/leaderboard' },
    
    // AI Routes
    { name: 'AI - Test', method: 'GET', path: '/api/ai/test' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    
    const result = await testRoute(test.method, test.path);
    
    if (result.success) {
      console.log(`${colors.green}✅ PASSED${colors.reset} (${result.status})`);
      passed++;
    } else {
      console.log(`${colors.red}❌ FAILED${colors.reset} (${result.status || 'Error'})`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n${colors.blue}📊 Results:${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${tests.length}\n`);

  if (failed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed. Check the errors above.${colors.reset}\n`);
  }
}

// Run tests
runTests().catch(console.error);

