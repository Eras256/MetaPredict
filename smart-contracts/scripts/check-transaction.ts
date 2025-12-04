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

async function main() {
  const txHash = process.env.TX_HASH || "0x5300a66ce90746b49d5a855191b488d2fea35a873608dd4208c1be17e6f025ed";
  
  console.log("🔍 Verificando transacción:", txHash);
  console.log("");

  try {
    const provider = ethers.provider;
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      console.log("❌ Transacción no encontrada");
      return;
    }

    console.log("✅ Transacción encontrada:");
    console.log("   Bloque:", receipt.blockNumber);
    console.log("   Estado:", receipt.status === 1 ? "Éxito" : "Falló");
    console.log("   Gas usado:", receipt.gasUsed.toString());
    console.log("");

    if (receipt.status === 0) {
      console.log("❌ La transacción falló");
      console.log("");
      console.log("📋 Intentando decodificar el error...");
      
      // Intentar obtener el error de la transacción
      const tx = await provider.getTransaction(txHash);
      if (tx) {
        try {
          await provider.call(tx);
        } catch (error: any) {
          console.log("   Error:", error.message || error.reason || "Desconocido");
        }
      }
    } else {
      console.log("✅ La transacción fue exitosa");
      console.log("");
      console.log("📋 Eventos emitidos:", receipt.logs.length);
      
      // Buscar eventos MarketCreated
      const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC";
      const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
      const core = PredictionMarketCore.attach(CORE_CONTRACT);
      
      for (const log of receipt.logs) {
        try {
          const parsed = core.interface.parseLog(log);
          if (parsed && parsed.name === 'MarketCreated') {
            console.log("   ✅ Evento MarketCreated encontrado:");
            console.log("      Market ID:", parsed.args[0].toString());
            console.log("      Tipo:", parsed.args[1] === 0 ? "Binary" : parsed.args[1] === 1 ? "Conditional" : "Subjective");
            console.log("      Creador:", parsed.args[2]);
            console.log("      Resolution Time:", new Date(Number(parsed.args[3]) * 1000).toLocaleString());
          }
        } catch (e) {
          // No es un evento del Core
        }
      }
    }

  } catch (error: any) {
    console.error("❌ Error al verificar la transacción:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

