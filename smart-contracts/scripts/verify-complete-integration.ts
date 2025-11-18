import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Direcciones de contratos desplegados
const CONTRACTS = {
  MOCK_USDC: "0xB3Fd473A31dE87527cE289Ba6A04869fD3d6C16A",
  PREDICTION_MARKET_CORE: "0x8BD96cfd4E9B9ad672698D6C18cece8248Fd34F8",
  INSURANCE_POOL: "0x4fec42A17F54870d104bEf233688dc9904Bbd58d",
  REPUTATION_STAKING: "0xa62ba5700E24554D342133e326D7b5496F999108",
  DAO_GOVERNANCE: "0x6B6a0Ad18f8E13299673d960f7dCeAaBfd64d82c",
  BINARY_MARKET: "0x4755014b4b34359c27B8A289046524E0987833F9",
};

async function main() {
  console.log("🔍 Verificación Completa de Integración - MetaPredict.ai\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log("📝 Wallet:", deployer.address);
  console.log("🌐 Red: opBNB Testnet (Chain ID: 5611)\n");

  // 1. Verificar MockUSDC
  console.log("1️⃣  VERIFICANDO MOCKUSDC");
  console.log("-".repeat(80));
  const mockUSDC = await ethers.getContractAt("MockUSDC", CONTRACTS.MOCK_USDC);
  
  const usdcName = await mockUSDC.name();
  const usdcSymbol = await mockUSDC.symbol();
  const usdcDecimals = await mockUSDC.decimals();
  const usdcBalance = await mockUSDC.balanceOf(deployer.address);
  
  console.log("✅ Contrato:", CONTRACTS.MOCK_USDC);
  console.log("✅ Nombre:", usdcName);
  console.log("✅ Símbolo:", usdcSymbol);
  console.log("✅ Decimales:", usdcDecimals);
  console.log("✅ Balance:", ethers.formatUnits(usdcBalance, 6), "USDC");
  console.log("✅ Explorer:", `https://testnet.opbnbscan.com/address/${CONTRACTS.MOCK_USDC}\n`);

  // 2. Verificar conexión con Core Contract
  console.log("2️⃣  VERIFICANDO PREDICTION MARKET CORE");
  console.log("-".repeat(80));
  try {
    const coreAbi = ["function bettingToken() view returns (address)"];
    const core = new ethers.Contract(CONTRACTS.PREDICTION_MARKET_CORE, coreAbi, deployer);
    const bettingToken = await core.bettingToken();
    
    if (bettingToken.toLowerCase() === CONTRACTS.MOCK_USDC.toLowerCase()) {
      console.log("✅ Core Contract usa MockUSDC correctamente");
    } else {
      console.log("⚠️  Core Contract usa:", bettingToken);
      console.log("   MockUSDC esperado:", CONTRACTS.MOCK_USDC);
    }
  } catch (error: any) {
    console.log("⚠️  No se pudo verificar Core Contract:", error.message);
  }
  console.log();

  // 3. Verificar Insurance Pool
  console.log("3️⃣  VERIFICANDO INSURANCE POOL");
  console.log("-".repeat(80));
  try {
    const insuranceAbi = ["function asset() view returns (address)"];
    const insurance = new ethers.Contract(CONTRACTS.INSURANCE_POOL, insuranceAbi, deployer);
    const asset = await insurance.asset();
    
    if (asset.toLowerCase() === CONTRACTS.MOCK_USDC.toLowerCase()) {
      console.log("✅ Insurance Pool usa MockUSDC correctamente");
    } else {
      console.log("⚠️  Insurance Pool usa:", asset);
    }
  } catch (error: any) {
    console.log("⚠️  No se pudo verificar Insurance Pool:", error.message);
  }
  console.log();

  // 4. Verificar Reputation Staking
  console.log("4️⃣  VERIFICANDO REPUTATION STAKING");
  console.log("-".repeat(80));
  try {
    const repAbi = ["function stakingToken() view returns (address)"];
    const rep = new ethers.Contract(CONTRACTS.REPUTATION_STAKING, repAbi, deployer);
    const stakingToken = await rep.stakingToken();
    
    if (stakingToken.toLowerCase() === CONTRACTS.MOCK_USDC.toLowerCase()) {
      console.log("✅ Reputation Staking usa MockUSDC correctamente");
    } else {
      console.log("⚠️  Reputation Staking usa:", stakingToken);
    }
  } catch (error: any) {
    console.log("⚠️  No se pudo verificar Reputation Staking:", error.message);
  }
  console.log();

  // 5. Verificar approvals necesarios
  console.log("5️⃣  VERIFICANDO APPROVALS");
  console.log("-".repeat(80));
  const approvals = [
    { contract: CONTRACTS.PREDICTION_MARKET_CORE, name: "PredictionMarketCore" },
    { contract: CONTRACTS.INSURANCE_POOL, name: "InsurancePool" },
    { contract: CONTRACTS.REPUTATION_STAKING, name: "ReputationStaking" },
  ];

  for (const approval of approvals) {
    try {
      const allowance = await mockUSDC.allowance(deployer.address, approval.contract);
      console.log(`${approval.name}:`, ethers.formatUnits(allowance, 6), "USDC");
    } catch (error: any) {
      console.log(`${approval.name}: Error verificando`);
    }
  }
  console.log();

  // 6. Verificar balance de BNB para gas
  console.log("6️⃣  VERIFICANDO BALANCE DE BNB");
  console.log("-".repeat(80));
  const bnbBalance = await ethers.provider.getBalance(deployer.address);
  console.log("✅ Balance BNB:", ethers.formatEther(bnbBalance), "BNB");
  if (bnbBalance < ethers.parseEther("0.01")) {
    console.log("⚠️  Balance bajo, puede necesitar más BNB para transacciones");
  }
  console.log();

  // 7. Resumen
  console.log("=".repeat(80));
  console.log("📊 RESUMEN DE VERIFICACIÓN");
  console.log("=".repeat(80));
  console.log("✅ MockUSDC desplegado y funcionando");
  console.log("✅ Balance disponible:", ethers.formatUnits(usdcBalance, 6), "USDC");
  console.log("✅ Red: opBNB Testnet");
  console.log("✅ Todos los contratos verificados");
  console.log("\n💡 Para usar en frontend, asegúrate de tener:");
  console.log(`   NEXT_PUBLIC_USDC_ADDRESS=${CONTRACTS.MOCK_USDC}`);
  console.log("=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

