import * as dotenv from "dotenv";
import * as path from "path";
import { ethers } from "ethers";

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script para verificar que todo está configurado correctamente para deployment
 * 
 * Uso:
 *   npx ts-node scripts/verify-deployment-setup.ts
 */
async function main() {
  console.log("🔍 Verificando configuración de deployment...\n");

  // 1. Verificar PRIVATE_KEY
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ ERROR: PRIVATE_KEY no está configurada en .env");
    console.error("   Agrega: PRIVATE_KEY=tu_private_key_sin_0x");
    process.exit(1);
  }

  // Validar formato - limpiar espacios y 0x
  const cleanKey = privateKey.trim().replace(/^0x/, '').replace(/\s/g, '');
  if (!cleanKey.match(/^[0-9a-fA-F]{64}$/)) {
    console.error("❌ ERROR: PRIVATE_KEY tiene formato inválido");
    console.error("   Debe ser una cadena hexadecimal de 64 caracteres (sin 0x)");
    console.error("   Longitud actual:", cleanKey.length);
    console.error("   Primeros 10 caracteres:", cleanKey.substring(0, 10));
    process.exit(1);
  }

  // Crear wallet (usar cleanKey sin 0x)
  const wallet = new ethers.Wallet('0x' + cleanKey);
  console.log("✅ PRIVATE_KEY configurada correctamente");
  console.log("   Address:", wallet.address);
  console.log("");

  // 2. Verificar RPC_URL_TESTNET
  const rpcUrl = process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org";
  console.log("✅ RPC_URL_TESTNET configurada");
  console.log("   URL:", rpcUrl);
  console.log("");

  // 3. Verificar balance en opBNB Testnet
  console.log("📡 Conectando a opBNB Testnet...");
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(wallet.address);
    const balanceBNB = ethers.utils.formatEther(balance);
    
    console.log("💰 Balance en opBNB Testnet:");
    console.log("   ", balanceBNB, "tBNB");
    console.log("");

    const balanceNum = parseFloat(balanceBNB);
    if (balanceNum === 0) {
      console.error("❌ ERROR: No tienes saldo en opBNB Testnet");
      console.error("   Obtén tBNB en:");
      console.error("   - L2Faucet: https://www.l2faucet.com/opbnb");
      console.error("   - Thirdweb: https://thirdweb.com/opbnb-testnet");
      console.error("   Dirección:", wallet.address);
      process.exit(1);
    } else if (balanceNum < 0.1) {
      console.warn("⚠️  ADVERTENCIA: Balance bajo (< 0.1 tBNB)");
      console.warn("   Puede no ser suficiente para deployment completo");
      console.warn("   Considera obtener más tokens de los faucets");
    } else {
      console.log("✅ Balance suficiente para deployment");
    }
    console.log("");

    // 4. Verificar BSCSCAN_API_KEY (opcional pero recomendado)
    const bscscanKey = process.env.BSCSCAN_API_KEY;
    if (!bscscanKey || bscscanKey === "your_bscscan_api_key_here") {
      console.warn("⚠️  BSCSCAN_API_KEY no configurada");
      console.warn("   No podrás verificar contratos automáticamente");
      console.warn("   Obtén una en: https://bscscan.com/myapikey");
    } else {
      console.log("✅ BSCSCAN_API_KEY configurada");
    }
    console.log("");

    // 5. Resumen final
    console.log("📋 RESUMEN DE CONFIGURACIÓN:");
    console.log("   ✅ Private Key: Configurada");
    console.log("   ✅ RPC URL: Configurada");
    console.log("   ✅ Balance: " + balanceBNB + " tBNB");
    console.log("   " + (bscscanKey && bscscanKey !== "your_bscscan_api_key_here" ? "✅" : "⚠️ ") + " BSCScan API: " + (bscscanKey ? "Configurada" : "No configurada"));
    console.log("");
    console.log("🚀 Listo para deployment!");
    console.log("");
    console.log("Comando de deployment:");
    console.log("   pnpm hardhat run scripts/deploy.ts --network opBNBTestnet");
    console.log("");

  } catch (error: any) {
    console.error("❌ ERROR conectando a opBNB Testnet:");
    console.error("   ", error.message);
    console.error("");
    console.error("Verifica que RPC_URL_TESTNET sea correcta");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});

