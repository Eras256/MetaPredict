import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
// @ts-ignore - Hardhat types may not be fully updated
import { ethers } from "hardhat";

// Load .env
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0x3Ee41D06739AB1fb90FB6718CE579e84b00FfA99";

async function main() {
  console.log("🔍 Debug: Investigando error 'execution reverted' en placeBet\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando cuenta:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "BNB");
    console.log("");

    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Verificar si el contrato está pausado
    const isPaused = await core.paused();
    console.log("📋 Estado del Core:");
    console.log("   Pausado:", isPaused ? "❌ SÍ (no se pueden hacer apuestas)" : "✅ NO");
    console.log("");

    // Obtener límites de apuesta
    const minBet = await core.MIN_BET();
    const maxBet = await core.MAX_BET();
    console.log("📋 Límites de apuesta:");
    console.log("   Mínimo:", ethers.formatEther(minBet), "BNB");
    console.log("   Máximo:", ethers.formatEther(maxBet), "BNB");
    console.log("");

    // Listar mercados activos
    const marketCounter = await core.marketCounter();
    const totalMarkets = Number(marketCounter);
    console.log("📊 Total de mercados:", totalMarkets);
    console.log("");

    if (totalMarkets === 0) {
      console.log("❌ No hay mercados creados");
      return;
    }

    // Verificar los primeros 5 mercados
    console.log("🔍 Verificando mercados activos:\n");
    const activeMarkets: number[] = [];

    for (let i = 1; i <= Math.min(totalMarkets, 5); i++) {
      try {
        const marketInfo = await core.markets(i);
        const marketTypeNum = Number(marketInfo.marketType);
        const statusNum = Number(marketInfo.status);
        
        const typeMap = ['Binary', 'Conditional', 'Subjective'];
        const statusMap = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
        
        const marketType = typeMap[marketTypeNum] || 'Unknown';
        const status = statusMap[statusNum] || 'Unknown';
        
        console.log(`   Mercado ${i}:`);
        console.log(`      Tipo: ${marketType}`);
        console.log(`      Estado: ${status}`);
        
        if (statusNum === 0) {
          activeMarkets.push(i);
          console.log(`      ✅ Activo - Puede recibir apuestas`);
          
          // Verificar el contrato del mercado
          const marketContractAddress = await core.marketTypeContract(i);
          console.log(`      Contrato: ${marketContractAddress}`);
          
          // Verificar coreContract del mercado
          try {
            const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
            const binaryMarket = BinaryMarket.attach(marketContractAddress);
            const marketCoreContract = await binaryMarket.coreContract();
            console.log(`      coreContract: ${marketCoreContract}`);
            console.log(`      ¿Coincide con Core?: ${marketCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase() ? '✅' : '❌'}`);
          } catch (e) {
            console.log(`      ⚠️  No se pudo verificar coreContract`);
          }
        } else {
          console.log(`      ❌ No activo - No puede recibir apuestas`);
        }
        console.log("");
      } catch (error: any) {
        console.log(`   ⚠️  Error verificando mercado ${i}:`, error.message);
        console.log("");
      }
    }

    if (activeMarkets.length === 0) {
      console.log("❌ No hay mercados activos disponibles");
      console.log("");
      console.log("💡 Crea un nuevo mercado ejecutando:");
      console.log("   pnpm hardhat run scripts/create-active-market.ts --network opBNBTestnet");
      return;
    }

    // Probar una apuesta en el primer mercado activo
    const testMarketId = activeMarkets[0];
    console.log(`💰 Probando apuesta en mercado ${testMarketId}...`);
    console.log("");

    const testAmount = ethers.parseEther("0.01");
    
    // Verificar que la cantidad esté dentro de los límites
    if (testAmount < minBet || testAmount > maxBet) {
      console.log("❌ Error: La cantidad de prueba está fuera de los límites");
      return;
    }

    try {
      // Intentar call estático primero
      console.log("📋 Intentando call estático...");
      await core.placeBet.staticCall(
        BigInt(testMarketId),
        true,
        { value: testAmount }
      );
      console.log("   ✅ Call estático exitoso - La transacción debería funcionar");
      console.log("");

      // Si el call estático funciona, intentar la transacción real
      console.log("📤 Enviando transacción real...");
      const tx = await core.placeBet(
        BigInt(testMarketId),
        true,
        { value: testAmount }
      );
      console.log("   📤 Transacción enviada:", tx.hash);
      const receipt = await tx.wait();
      console.log("   ✅ Transacción confirmada en el bloque:", receipt.blockNumber);
      console.log("   ✅ Apuesta exitosa!");
    } catch (error: any) {
      console.log("   ❌ Error:", error.message);
      
      // Intentar obtener más detalles del error
      if (error.data) {
        console.log("   📋 Datos del error:", error.data);
      }
      
      if (error.reason) {
        console.log("   📋 Razón:", error.reason);
      }
      
      // Verificar causas comunes
      console.log("");
      console.log("🔍 Posibles causas:");
      console.log("   1. El mercado fue creado con el Core anterior");
      console.log("   2. El mercado no está activo");
      console.log("   3. La cantidad está fuera de los límites");
      console.log("   4. El contrato está pausado");
      console.log("   5. El mercado no existe en el contrato de mercado");
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



