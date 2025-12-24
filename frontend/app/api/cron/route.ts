import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import axios from 'axios';
import AIOracleABI from '@/lib/contracts/abi/AIOracle.json';
import PredictionMarketCoreABI from '@/lib/contracts/abi/PredictionMarketCore.json';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes maximum to process multiple markets

/**
 * GET /api/cron
 * @description Vercel Cron Job to resolve all pending markets in "Resolving" status
 * This runs daily at 12:00 PM (noon) to resolve markets that need manual resolution
 * 
 * Security: Verify request comes from Vercel Cron using CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Verify request comes from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In production, Vercel automatically adds the authorization header
      // For local testing, allow if CRON_SECRET is not set
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('🕐 [Cron] Starting resolution of pending markets...');
    console.log(`📅 [Cron] Timestamp: ${new Date().toISOString()}`);

    // Contract and RPC configuration
    const CORE_CONTRACT = CONTRACT_ADDRESSES.CORE_CONTRACT;
    const AI_ORACLE_ADDRESS = process.env.AI_ORACLE_ADDRESS || CONTRACT_ADDRESSES.AI_ORACLE;
    const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://www.metapredict.fun/api';
    
    // RPC URL
    const rpcUrl = process.env.RPC_URL_TESTNET || 
                   process.env.NEXT_PUBLIC_OPBNB_TESTNET_RPC || 
                   'https://opbnb-testnet-rpc.bnbchain.org';

    // Verify we have the private key
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is not configured in environment variables');
    }

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`📝 [Cron] Using account: ${wallet.address}`);
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 [Cron] Balance: ${ethers.formatEther(balance)} BNB`);

    // Connect to contracts
    const core = new ethers.Contract(
      CORE_CONTRACT,
      PredictionMarketCoreABI,
      provider
    );

    const aiOracle = new ethers.Contract(
      AI_ORACLE_ADDRESS,
      AIOracleABI,
      wallet // Use wallet to be able to make transactions
    );

    // Verify we are the owner of the AI Oracle
    const owner = await aiOracle.owner();
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      const errorMsg = `❌ You are not the owner of the AI Oracle. Current owner: ${owner}`;
      console.error(`[Cron] ${errorMsg}`);
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }
    console.log(`✅ [Cron] You are the owner of the AI Oracle`);

    // Get market counter
    const marketCounter = await core.marketCounter();
    const totalMarkets = Number(marketCounter);
    console.log(`📊 [Cron] Total markets: ${totalMarkets}`);

    if (totalMarkets === 0) {
      return NextResponse.json({
        success: true,
        message: 'No markets to process',
        timestamp: new Date().toISOString(),
        resolved: 0,
        failed: 0,
        total: 0,
      });
    }

    const statusNames = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
    const resolvingMarkets: Array<{ id: number; question: string }> = [];

    // Find all markets in "Resolving" status
    console.log(`🔍 [Cron] Searching for markets in 'Resolving' status...`);
    
    for (let i = 1; i <= totalMarkets; i++) {
      try {
        const market = await core.getMarket(i);
        const status = Number(market.status);
        
        if (status === 1) { // Status 1 = Resolving
          // Parse metadata to get the question
          let question = '';
          try {
            const metadata = JSON.parse(market.metadata);
            question = metadata.question || metadata.description || `Market #${i}`;
          } catch {
            question = market.metadata || `Market #${i}`;
          }
          
          resolvingMarkets.push({ id: i, question });
        }
      } catch (error: any) {
        console.log(`⚠️  [Cron] Error getting market #${i}: ${error.message}`);
      }
    }

    console.log(`📋 [Cron] Found ${resolvingMarkets.length} markets in 'Resolving' status`);

    if (resolvingMarkets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No markets pending resolution',
        timestamp: new Date().toISOString(),
        resolved: 0,
        failed: 0,
        total: 0,
      });
    }

    let resolved = 0;
    let failed = 0;
    const results: Array<{ marketId: number; success: boolean; error?: string }> = [];

    // Process each market
    for (const market of resolvingMarkets) {
      try {
        console.log(`\n🔄 [Cron] Processing Market #${market.id}...`);
        console.log(`   Question: ${market.question}`);

        // Check if already resolved in AI Oracle
        const result = await aiOracle.getResult(market.id);
        if (result.resolved) {
          console.log(`   ⚠️  Already resolved in AI Oracle. Skipping...`);
          results.push({ marketId: market.id, success: true });
          continue;
        }

        // Call backend to get AI consensus
        console.log(`   📡 Calling backend to get AI consensus...`);
        let outcome: number;
        let confidence: number;

        try {
          const backendResponse = await axios.post(
            `${BACKEND_URL}/oracle/resolve`,
            {
              marketDescription: market.question,
              priceId: null,
            },
            {
              timeout: 60000, // 60 seconds timeout
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          outcome = backendResponse.data.outcome; // 1=Yes, 2=No, 3=Invalid
          confidence = backendResponse.data.confidence; // 0-100

          if (!outcome || confidence === undefined) {
            throw new Error('Invalid response from backend');
          }

          console.log(`   ✅ Backend responded: Outcome=${outcome === 1 ? 'Yes' : outcome === 2 ? 'No' : 'Invalid'}, Confidence=${confidence}%`);
        } catch (backendError: any) {
          console.log(`   ⚠️  Error calling backend: ${backendError.message}`);
          console.log(`   💡 Using default values: Yes with 85% confidence`);
          outcome = 1; // Yes by default
          confidence = 85;
        }

        // Resolve market using fulfillResolutionManual
        console.log(`   📝 Calling fulfillResolutionManual(${market.id}, ${outcome}, ${confidence})...`);
        
        const tx = await aiOracle.fulfillResolutionManual(market.id, outcome, confidence);
        console.log(`   📤 Transaction sent: ${tx.hash}`);
        console.log(`   🔗 View on opBNBScan: https://testnet.opbnbscan.com/tx/${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`   ✅ Transaction confirmed in block: ${receipt.blockNumber}`);

        // Verify result
        const newResult = await aiOracle.getResult(market.id);
        const updatedMarket = await core.getMarket(market.id);
        
        console.log(`   ✅ Market #${market.id} resolved successfully`);
        console.log(`      Status: ${statusNames[Number(updatedMarket.status)]}`);
        console.log(`      Outcome: ${newResult.yesVotes > 0 ? 'Yes' : newResult.noVotes > 0 ? 'No' : 'Invalid'}`);
        console.log(`      Confidence: ${newResult.confidence}%`);

        resolved++;
        results.push({ marketId: market.id, success: true });
        
        // Wait a bit between transactions to avoid issues
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error: any) {
        console.log(`   ❌ Error resolving Market #${market.id}: ${error.message}`);
        failed++;
        results.push({ marketId: market.id, success: false, error: error.message });
        
        if (error.message?.includes('already resolved')) {
          console.log(`   💡 Market is already resolved. Continuing...`);
        } else if (error.message?.includes('Unauthorized')) {
          console.log(`   💡 You don't have permission to resolve this market.`);
        }
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      resolved,
      failed,
      total: resolvingMarkets.length,
      results,
      message: `Processed ${resolvingMarkets.length} market(s): ${resolved} resolved, ${failed} failed`,
    };

    console.log('\n' + '='.repeat(80));
    console.log('📊 [Cron] Summary:');
    console.log(`   ✅ Successfully resolved: ${resolved}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📋 Total processed: ${resolvingMarkets.length}`);

    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('[Cron] Error general:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

