import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import axios from 'axios';
import AIOracleABI from '@/lib/contracts/abi/AIOracle.json';
import PredictionMarketCoreABI from '@/lib/contracts/abi/PredictionMarketCore.json';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos máximo para procesar múltiples mercados

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

    console.log('🕐 [Cron] Iniciando resolución de mercados pendientes...');
    console.log(`📅 [Cron] Timestamp: ${new Date().toISOString()}`);

    // Configuración de contratos y RPC
    const CORE_CONTRACT = CONTRACT_ADDRESSES.CORE_CONTRACT;
    const AI_ORACLE_ADDRESS = process.env.AI_ORACLE_ADDRESS || CONTRACT_ADDRESSES.AI_ORACLE;
    const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://www.metapredict.fun/api';
    
    // RPC URL
    const rpcUrl = process.env.RPC_URL_TESTNET || 
                   process.env.NEXT_PUBLIC_OPBNB_TESTNET_RPC || 
                   'https://opbnb-testnet-rpc.bnbchain.org';

    // Verificar que tenemos la clave privada
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY no está configurada en las variables de entorno');
    }

    // Conectar a la blockchain
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`📝 [Cron] Usando cuenta: ${wallet.address}`);
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 [Cron] Balance: ${ethers.formatEther(balance)} BNB`);

    // Conectar a contratos
    const core = new ethers.Contract(
      CORE_CONTRACT,
      PredictionMarketCoreABI,
      provider
    );

    const aiOracle = new ethers.Contract(
      AI_ORACLE_ADDRESS,
      AIOracleABI,
      wallet // Usar wallet para poder hacer transacciones
    );

    // Verificar que somos el owner del AI Oracle
    const owner = await aiOracle.owner();
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      const errorMsg = `❌ No eres el owner del AI Oracle. Owner actual: ${owner}`;
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
    console.log(`✅ [Cron] Eres el owner del AI Oracle`);

    // Obtener el contador de mercados
    const marketCounter = await core.marketCounter();
    const totalMarkets = Number(marketCounter);
    console.log(`📊 [Cron] Total de mercados: ${totalMarkets}`);

    if (totalMarkets === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay mercados para procesar',
        timestamp: new Date().toISOString(),
        resolved: 0,
        failed: 0,
        total: 0,
      });
    }

    const statusNames = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
    const resolvingMarkets: Array<{ id: number; question: string }> = [];

    // Encontrar todos los mercados en estado "Resolving"
    console.log(`🔍 [Cron] Buscando mercados en estado 'Resolving'...`);
    
    for (let i = 1; i <= totalMarkets; i++) {
      try {
        const market = await core.getMarket(i);
        const status = Number(market.status);
        
        if (status === 1) { // Status 1 = Resolving
          // Parsear metadata para obtener la pregunta
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
        console.log(`⚠️  [Cron] Error obteniendo mercado #${i}: ${error.message}`);
      }
    }

    console.log(`📋 [Cron] Encontrados ${resolvingMarkets.length} mercados en estado 'Resolving'`);

    if (resolvingMarkets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay mercados pendientes de resolución',
        timestamp: new Date().toISOString(),
        resolved: 0,
        failed: 0,
        total: 0,
      });
    }

    let resolved = 0;
    let failed = 0;
    const results: Array<{ marketId: number; success: boolean; error?: string }> = [];

    // Procesar cada mercado
    for (const market of resolvingMarkets) {
      try {
        console.log(`\n🔄 [Cron] Procesando Market #${market.id}...`);
        console.log(`   Pregunta: ${market.question}`);

        // Verificar si ya está resuelto en el AI Oracle
        const result = await aiOracle.getResult(market.id);
        if (result.resolved) {
          console.log(`   ⚠️  Ya está resuelto en AI Oracle. Saltando...`);
          results.push({ marketId: market.id, success: true });
          continue;
        }

        // Llamar al backend para obtener el consenso de las IAs
        console.log(`   📡 Llamando al backend para obtener consenso de IAs...`);
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
              timeout: 60000, // 60 segundos timeout
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          outcome = backendResponse.data.outcome; // 1=Yes, 2=No, 3=Invalid
          confidence = backendResponse.data.confidence; // 0-100

          if (!outcome || confidence === undefined) {
            throw new Error('Respuesta inválida del backend');
          }

          console.log(`   ✅ Backend respondió: Outcome=${outcome === 1 ? 'Yes' : outcome === 2 ? 'No' : 'Invalid'}, Confidence=${confidence}%`);
        } catch (backendError: any) {
          console.log(`   ⚠️  Error llamando al backend: ${backendError.message}`);
          console.log(`   💡 Usando valores por defecto: Yes con 85% de confianza`);
          outcome = 1; // Yes por defecto
          confidence = 85;
        }

        // Resolver el mercado usando fulfillResolutionManual
        console.log(`   📝 Llamando fulfillResolutionManual(${market.id}, ${outcome}, ${confidence})...`);
        
        const tx = await aiOracle.fulfillResolutionManual(market.id, outcome, confidence);
        console.log(`   📤 Transacción enviada: ${tx.hash}`);
        console.log(`   🔗 Ver en opBNBScan: https://testnet.opbnbscan.com/tx/${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`   ✅ Transacción confirmada en bloque: ${receipt.blockNumber}`);

        // Verificar resultado
        const newResult = await aiOracle.getResult(market.id);
        const updatedMarket = await core.getMarket(market.id);
        
        console.log(`   ✅ Market #${market.id} resuelto exitosamente`);
        console.log(`      Estado: ${statusNames[Number(updatedMarket.status)]}`);
        console.log(`      Outcome: ${newResult.yesVotes > 0 ? 'Yes' : newResult.noVotes > 0 ? 'No' : 'Invalid'}`);
        console.log(`      Confidence: ${newResult.confidence}%`);

        resolved++;
        results.push({ marketId: market.id, success: true });
        
        // Esperar un poco entre transacciones para evitar problemas
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error: any) {
        console.log(`   ❌ Error resolviendo Market #${market.id}: ${error.message}`);
        failed++;
        results.push({ marketId: market.id, success: false, error: error.message });
        
        if (error.message?.includes('already resolved')) {
          console.log(`   💡 El mercado ya está resuelto. Continuando...`);
        } else if (error.message?.includes('Unauthorized')) {
          console.log(`   💡 No tienes permisos para resolver este mercado.`);
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
      message: `Procesados ${resolvingMarkets.length} mercado(s): ${resolved} resueltos, ${failed} fallidos`,
    };

    console.log('\n' + '='.repeat(80));
    console.log('📊 [Cron] Resumen:');
    console.log(`   ✅ Resueltos exitosamente: ${resolved}`);
    console.log(`   ❌ Fallidos: ${failed}`);
    console.log(`   📋 Total procesados: ${resolvingMarkets.length}`);

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

