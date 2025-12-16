// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Dirección del OmniRouter desde addresses.ts
const OMNI_ROUTER_ADDRESS = process.env.OMNI_ROUTER_ADDRESS || "0x11C1124384e463d99Ba84348280e318FbeE544d0";

// Configuración de cadenas soportadas
// Formato: { chainId, remoteContract, gasLimit, baseFee, skipIfZeroAddress }
// IMPORTANTE: Para agregar cadenas que aún no tienen contratos desplegados,
// usa ethers.ZeroAddress como placeholder y el script las omitirá automáticamente
const SUPPORTED_CHAINS = [
  {
    chainId: 5611, // opBNB Testnet
    name: "opBNB Testnet",
    remoteContract: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1", // Core Contract en opBNB Testnet
    gasLimit: 500000,
    baseFee: ethers.parseEther("0.001"), // 0.001 BNB
    skipIfZeroAddress: false, // Ya está desplegado
  },
  {
    chainId: 97, // BSC Testnet
    name: "BSC Testnet",
    remoteContract: process.env.BSC_TESTNET_CORE_CONTRACT || ethers.ZeroAddress, // Actualizar después de desplegar
    gasLimit: 500000,
    baseFee: ethers.parseEther("0.001"), // 0.001 BNB
    skipIfZeroAddress: true, // Omitir si no está desplegado
  },
  {
    chainId: 56, // BSC Mainnet
    name: "BSC Mainnet",
    remoteContract: process.env.BSC_MAINNET_CORE_CONTRACT || ethers.ZeroAddress, // Actualizar después de desplegar
    gasLimit: 500000,
    baseFee: ethers.parseEther("0.001"), // 0.001 BNB
    skipIfZeroAddress: true, // Omitir si no está desplegado
  },
  {
    chainId: 204, // opBNB Mainnet
    name: "opBNB Mainnet",
    remoteContract: process.env.OPBNB_MAINNET_CORE_CONTRACT || ethers.ZeroAddress, // Actualizar después de desplegar
    gasLimit: 500000,
    baseFee: ethers.parseEther("0.001"), // 0.001 BNB
    skipIfZeroAddress: true, // Omitir si no está desplegado
  },
];

async function main() {
  console.log("🔧 Configurando OmniRouter - Agregando cadenas soportadas\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Wallet: ${deployer.address}`);
  console.log(`📝 OmniRouter: ${OMNI_ROUTER_ADDRESS}\n`);

  // Obtener instancia del contrato OmniRouter
  const OmniRouter = await ethers.getContractFactory("OmniRouter");
  const omniRouter = OmniRouter.attach(OMNI_ROUTER_ADDRESS);

  // Verificar que somos el owner
  const owner = await omniRouter.owner();
  console.log(`📝 Owner del contrato: ${owner}`);
  
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.log(`❌ ERROR: No eres el owner del contrato`);
    console.log(`   Owner actual: ${owner}`);
    console.log(`   Tu dirección: ${deployer.address}`);
    console.log(`   Solo el owner puede agregar cadenas soportadas.\n`);
    process.exit(1);
  }

  // Obtener cadenas actualmente soportadas
  const currentChains = await omniRouter.getSupportedChains();
  console.log(`📋 Cadenas actualmente soportadas: ${currentChains.length}`);
  if (currentChains.length > 0) {
    console.log(`   Chain IDs: ${currentChains.map((id: bigint) => id.toString()).join(", ")}\n`);
  } else {
    console.log(`   (Ninguna cadena configurada aún)\n`);
  }

  // Configurar el Core Contract si no está configurado
  const currentCore = await omniRouter.coreContract();
  const expectedCore = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
  
  if (currentCore === ethers.ZeroAddress || currentCore.toLowerCase() !== expectedCore.toLowerCase()) {
    console.log("🔧 Configurando Core Contract...");
    try {
      const tx = await omniRouter.setCoreContract(expectedCore);
      const receipt = await tx.wait();
      console.log(`   ✅ Core Contract configurado`);
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`   Explorer: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);
    } catch (error: any) {
      console.log(`   ❌ Error configurando Core Contract: ${error.message}\n`);
    }
  } else {
    console.log(`✅ Core Contract ya está configurado: ${currentCore}\n`);
  }

  // Agregar cadenas soportadas
  console.log("🔧 Agregando cadenas soportadas...");
  console.log("-".repeat(80));

  let skippedCount = 0;
  let addedCount = 0;
  let alreadyConfiguredCount = 0;

  for (const chain of SUPPORTED_CHAINS) {
    try {
      // Omitir si la dirección es ZeroAddress y skipIfZeroAddress es true
      const isZeroAddress = chain.remoteContract === ethers.ZeroAddress || 
                           chain.remoteContract.toLowerCase() === ethers.ZeroAddress.toLowerCase();
      if (chain.skipIfZeroAddress && isZeroAddress) {
        console.log(`   ⏭️  ${chain.name} (Chain ID ${chain.chainId}) - Omitida (no desplegada aún)`);
        console.log(`      💡 Para agregar esta cadena:`);
        console.log(`         1. Despliega los contratos en ${chain.name}`);
        console.log(`         2. Configura la variable de entorno:`);
        if (chain.chainId === 97) {
          console.log(`            BSC_TESTNET_CORE_CONTRACT=0x...`);
        } else if (chain.chainId === 56) {
          console.log(`            BSC_MAINNET_CORE_CONTRACT=0x...`);
        } else if (chain.chainId === 204) {
          console.log(`            OPBNB_MAINNET_CORE_CONTRACT=0x...`);
        }
        console.log(`         3. Vuelve a ejecutar este script\n`);
        skippedCount++;
        continue;
      }

      // Verificar si la cadena ya está agregada
      const chainConfig = await omniRouter.chains(chain.chainId);
      
      if (chainConfig.supported) {
        console.log(`   ⏭️  ${chain.name} (Chain ID ${chain.chainId}) ya está configurada`);
        console.log(`      Remote Contract: ${chainConfig.remoteContract}`);
        console.log(`      Gas Limit: ${chainConfig.gasLimit.toString()}`);
        console.log(`      Base Fee: ${ethers.formatEther(chainConfig.baseFee)} BNB\n`);
        alreadyConfiguredCount++;
        continue;
      }

      console.log(`   📝 Agregando ${chain.name} (Chain ID ${chain.chainId})...`);
      console.log(`      Remote Contract: ${chain.remoteContract}`);
      console.log(`      Gas Limit: ${chain.gasLimit}`);
      console.log(`      Base Fee: ${ethers.formatEther(chain.baseFee)} BNB`);

      const tx = await omniRouter.addChain(
        chain.chainId,
        chain.remoteContract,
        chain.gasLimit,
        chain.baseFee
      );
      
      const receipt = await tx.wait();
      console.log(`      ✅ Cadena agregada exitosamente`);
      console.log(`      Transaction: ${receipt.hash}`);
      console.log(`      Explorer: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);
      addedCount++;
    } catch (error: any) {
      console.log(`      ❌ Error agregando ${chain.name} (Chain ID ${chain.chainId}): ${error.message}\n`);
    }
  }

  // Resumen
  if (skippedCount > 0 || addedCount > 0 || alreadyConfiguredCount > 0) {
    console.log("-".repeat(80));
    console.log("📊 Resumen:");
    if (addedCount > 0) console.log(`   ✅ Agregadas: ${addedCount}`);
    if (alreadyConfiguredCount > 0) console.log(`   ⏭️  Ya configuradas: ${alreadyConfiguredCount}`);
    if (skippedCount > 0) console.log(`   ⏭️  Omitidas (no desplegadas): ${skippedCount}`);
    console.log("");
  }

  // Verificar cadenas finales
  const finalChains = await omniRouter.getSupportedChains();
  console.log("=".repeat(80));
  console.log(`✅ Configuración completada`);
  console.log(`📋 Total de cadenas soportadas: ${finalChains.length}`);
  if (finalChains.length > 0) {
    console.log(`   Chain IDs: ${finalChains.map((id: bigint) => id.toString()).join(", ")}`);
  }
  console.log("\n💡 Las cadenas ahora deberían aparecer en la interfaz de usuario.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

