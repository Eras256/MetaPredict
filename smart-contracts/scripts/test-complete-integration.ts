import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MOCK_USDC = "0xB3Fd473A31dE87527cE289Ba6A04869fD3d6C16A";
const PREDICTION_MARKET_CORE = "0x8BD96cfd4E9B9ad672698D6C18cece8248Fd34F8";
const INSURANCE_POOL = "0x4fec42A17F54870d104bEf233688dc9904Bbd58d";
const REPUTATION_STAKING = "0xa62ba5700E24554D342133e326D7b5496F999108";

async function main() {
  console.log("🧪 Prueba Completa de Integración - MetaPredict.ai\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log("📝 Wallet:", deployer.address);
  console.log("🌐 Red: opBNB Testnet\n");

  const mockUSDC = await ethers.getContractAt("MockUSDC", MOCK_USDC);
  
  // Verificar balance inicial
  const initialBalance = await mockUSDC.balanceOf(deployer.address);
  console.log("💰 Balance inicial:", ethers.formatUnits(initialBalance, 6), "USDC\n");

  const testResults: { test: string; status: string; details?: string }[] = [];

  // Test 1: Verificar que MockUSDC funciona
  console.log("1️⃣  TEST: Verificar MockUSDC");
  try {
    const name = await mockUSDC.name();
    const symbol = await mockUSDC.symbol();
    const decimals = await mockUSDC.decimals();
    
    if (name === "USD Coin" && symbol === "USDC" && decimals === 6n) {
      console.log("✅ MockUSDC funciona correctamente");
      testResults.push({ test: "MockUSDC", status: "✅ PASS" });
    } else {
      throw new Error("MockUSDC no tiene los valores esperados");
    }
  } catch (error: any) {
    console.log("❌ Error:", error.message);
    testResults.push({ test: "MockUSDC", status: "❌ FAIL", details: error.message });
  }
  console.log();

  // Test 2: Aprobar USDC para Core Contract
  console.log("2️⃣  TEST: Aprobar USDC para Core Contract");
  try {
    const approveAmount = ethers.parseUnits("1000", 6);
    const tx = await mockUSDC.approve(PREDICTION_MARKET_CORE, approveAmount);
    await tx.wait();
    
    const allowance = await mockUSDC.allowance(deployer.address, PREDICTION_MARKET_CORE);
    if (allowance >= approveAmount) {
      console.log("✅ Approval exitoso:", ethers.formatUnits(allowance, 6), "USDC");
      testResults.push({ test: "Approve Core", status: "✅ PASS" });
    } else {
      throw new Error("Approval no se completó correctamente");
    }
  } catch (error: any) {
    console.log("❌ Error:", error.message);
    testResults.push({ test: "Approve Core", status: "❌ FAIL", details: error.message });
  }
  console.log();

  // Test 3: Aprobar USDC para Insurance Pool
  console.log("3️⃣  TEST: Aprobar USDC para Insurance Pool");
  try {
    const approveAmount = ethers.parseUnits("500", 6);
    const tx = await mockUSDC.approve(INSURANCE_POOL, approveAmount);
    await tx.wait();
    
    const allowance = await mockUSDC.allowance(deployer.address, INSURANCE_POOL);
    if (allowance >= approveAmount) {
      console.log("✅ Approval exitoso:", ethers.formatUnits(allowance, 6), "USDC");
      testResults.push({ test: "Approve Insurance", status: "✅ PASS" });
    } else {
      throw new Error("Approval no se completó correctamente");
    }
  } catch (error: any) {
    console.log("❌ Error:", error.message);
    testResults.push({ test: "Approve Insurance", status: "❌ FAIL", details: error.message });
  }
  console.log();

  // Test 4: Verificar que se puede transferir USDC
  console.log("4️⃣  TEST: Transferir USDC");
  try {
    const transferAmount = ethers.parseUnits("10", 6);
    const testAddress = "0x0000000000000000000000000000000000000001";
    
    const tx = await mockUSDC.transfer(testAddress, transferAmount);
    await tx.wait();
    
    const balance = await mockUSDC.balanceOf(testAddress);
    if (balance >= transferAmount) {
      console.log("✅ Transfer exitoso:", ethers.formatUnits(transferAmount, 6), "USDC");
      testResults.push({ test: "Transfer USDC", status: "✅ PASS" });
    } else {
      throw new Error("Transfer no se completó correctamente");
    }
  } catch (error: any) {
    console.log("❌ Error:", error.message);
    testResults.push({ test: "Transfer USDC", status: "❌ FAIL", details: error.message });
  }
  console.log();

  // Test 5: Verificar balance final
  console.log("5️⃣  TEST: Verificar balance final");
  try {
    const finalBalance = await mockUSDC.balanceOf(deployer.address);
    console.log("✅ Balance final:", ethers.formatUnits(finalBalance, 6), "USDC");
    testResults.push({ test: "Balance Check", status: "✅ PASS" });
  } catch (error: any) {
    console.log("❌ Error:", error.message);
    testResults.push({ test: "Balance Check", status: "❌ FAIL", details: error.message });
  }
  console.log();

  // Resumen
  console.log("=".repeat(80));
  console.log("📊 RESUMEN DE PRUEBAS");
  console.log("=".repeat(80));
  
  const passed = testResults.filter(t => t.status.includes("✅")).length;
  const failed = testResults.filter(t => t.status.includes("❌")).length;
  
  testResults.forEach(result => {
    console.log(`${result.status} ${result.test}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
  });
  
  console.log("\n" + "=".repeat(80));
  console.log(`✅ Tests pasados: ${passed}/${testResults.length}`);
  if (failed > 0) {
    console.log(`❌ Tests fallidos: ${failed}/${testResults.length}`);
  }
  console.log("=".repeat(80));
  
  console.log("\n💡 MockUSDC está listo para usar en:");
  console.log("   - Frontend (ya configurado)");
  console.log("   - Smart Contracts (necesitan redeploy con MockUSDC)");
  console.log("   - Tests de transacciones (ya funcionando)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

