import * as dotenv from "dotenv";
import * as path from "path";
import { ethers } from "hardhat";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const AI_ORACLE_ADDRESS = "0xc6e1B8FFFB8233793c346B667b3d6e205Bc46a71";
const CORE_CONTRACT = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";

async function main() {
  console.log("🔧 Corrigiendo predictionMarket en AI Oracle...\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Usando cuenta: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB\n`);

  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = AIOracle.attach(AI_ORACLE_ADDRESS);

  try {
    const owner = await aiOracle.owner();
    console.log(`👤 Owner del contrato: ${owner}`);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log(`❌ No eres el owner. Owner actual: ${owner}`);
      return;
    }

    const currentMarket = await aiOracle.predictionMarket();
    console.log(`📊 predictionMarket actual: ${currentMarket}`);

    if (currentMarket.toLowerCase() === CORE_CONTRACT.toLowerCase()) {
      console.log(`✅ predictionMarket ya está configurado correctamente\n`);
      return;
    }

    console.log(`\n🔄 Configurando predictionMarket a ${CORE_CONTRACT}...`);
    const tx = await aiOracle.setPredictionMarket(CORE_CONTRACT);
    console.log(`   📤 Transacción enviada: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`   ✅ Transacción confirmada en bloque: ${receipt.blockNumber}`);

    const newMarket = await aiOracle.predictionMarket();
    console.log(`\n📊 predictionMarket nuevo: ${newMarket}`);
    
    if (newMarket.toLowerCase() === CORE_CONTRACT.toLowerCase()) {
      console.log(`✅ Configuración exitosa!\n`);
    } else {
      console.log(`❌ Error: No se actualizó correctamente\n`);
    }

  } catch (error: any) {
    console.log(`\n❌ ERROR: ${error.message}\n`);
  }

  console.log("=".repeat(80));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

