import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Import ethers - @nomicfoundation/hardhat-toolbox provides this
// @ts-ignore - Hardhat types may not be fully updated
import { ethers } from "hardhat";

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script para configurar y verificar el wallet de deployment
 * 
 * Uso:
 *   npx ts-node scripts/setup-deployment-wallet.ts
 */
async function main() {
  console.log("🔧 Configurando wallet de deployment...\n");

  // La private key debe estar en .env como PRIVATE_KEY
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ ERROR: PRIVATE_KEY no está configurada en .env");
    console.error("   Por favor, agrega PRIVATE_KEY=tu_private_key en tu archivo .env");
    process.exit(1);
  }

  // Validar formato de private key
  if (!privateKey.match(/^[0-9a-fA-F]{64}$/)) {
    console.error("❌ ERROR: PRIVATE_KEY tiene formato inválido");
    console.error("   Debe ser una cadena hexadecimal de 64 caracteres (sin 0x)");
    process.exit(1);
  }

  // Crear wallet
  const wallet = new ethers.Wallet(privateKey);
  console.log("✅ Wallet configurado correctamente");
  console.log("   Address:", wallet.address);
  console.log("   Public Key:", wallet.publicKey.substring(0, 20) + "...\n");

  // Verificar balance en opBNB Testnet
  console.log("📡 Verificando balance en opBNB Testnet...");
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org"
    );
    
    const balance = await provider.getBalance(wallet.address);
    const balanceInBNB = ethers.utils.formatEther(balance);
    
    console.log("   Balance:", balanceInBNB, "tBNB");
    
    if (parseFloat(balanceInBNB) < 0.01) {
      console.log("\n⚠️  Balance insuficiente para deployment");
      console.log("   Necesitas al menos 0.1 tBNB para deployment");
      console.log("\n💧 Obtén tokens testnet en:");
      console.log("   1. L2Faucet: https://www.l2faucet.com/opbnb");
      console.log("   2. Thirdweb: https://thirdweb.com/opbnb-testnet");
      console.log("   3. BNB Chain: https://testnet.bnbchain.org/faucet-smart");
      console.log("\n   Dirección para recibir tokens:", wallet.address);
    } else {
      console.log("✅ Balance suficiente para deployment\n");
    }
  } catch (error: any) {
    console.error("⚠️  No se pudo verificar balance:", error.message);
    console.log("   Asegúrate de que RPC_URL_TESTNET esté configurada correctamente\n");
  }

  // Verificar balance en opBNB Mainnet (si está configurado)
  if (process.env.RPC_URL && process.env.RPC_URL.includes("mainnet")) {
    console.log("📡 Verificando balance en opBNB Mainnet...");
    try {
      const mainnetProvider = new ethers.providers.JsonRpcProvider(
        process.env.RPC_URL
      );
      
      const mainnetBalance = await mainnetProvider.getBalance(wallet.address);
      const mainnetBalanceInBNB = ethers.utils.formatEther(mainnetBalance);
      
      console.log("   Balance:", mainnetBalanceInBNB, "BNB");
      
      if (parseFloat(mainnetBalanceInBNB) < 0.01) {
        console.log("⚠️  Balance insuficiente en mainnet");
      } else {
        console.log("✅ Balance suficiente en mainnet");
      }
    } catch (error: any) {
      console.log("⚠️  No se pudo verificar balance en mainnet");
    }
  }

  console.log("\n✅ Configuración completa!");
  console.log("\n📋 Próximos pasos:");
  console.log("   1. Si no tienes tokens, usa los faucets mencionados arriba");
  console.log("   2. Verifica tu balance con: npx ts-node scripts/setup-deployment-wallet.ts");
  console.log("   3. Cuando tengas tokens, ejecuta: pnpm run deploy:testnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

