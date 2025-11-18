import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { ethers } from "hardhat";

// Load .env from root directory
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

async function main() {
  console.log("🔍 Verificando ownership de Chainlink Data Streams Integration...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Cuenta actual:", deployer.address, "\n");

  // Load deployment addresses
  const deploymentsPath = path.join(__dirname, "../deployments/opbnb-testnet.json");
  if (!fs.existsSync(deploymentsPath)) {
    console.error(`❌ Error: No se encontró el archivo de deployments`);
    process.exit(1);
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const contracts = deployments.contracts;

  const ChainlinkDataStreamsIntegration = await ethers.getContractFactory("ChainlinkDataStreamsIntegration");
  const dataStreams = ChainlinkDataStreamsIntegration.attach(contracts.dataStreamsIntegration);

  const owner = await dataStreams.owner();
  const coreAddress = contracts.core;

  console.log("📊 Ownership:");
  console.log("   Owner actual:", owner);
  console.log("   Core address:", coreAddress);
  console.log("   Deployer:", deployer.address);
  console.log("   ¿Es deployer el owner?", owner.toLowerCase() === deployer.address.toLowerCase() ? "✅ Sí" : "❌ No");
  console.log("   ¿Es Core el owner?", owner.toLowerCase() === coreAddress.toLowerCase() ? "✅ Sí" : "❌ No");

  if (owner.toLowerCase() !== deployer.address.toLowerCase() && owner.toLowerCase() !== coreAddress.toLowerCase()) {
    console.log("\n⚠️  El owner no es ni el deployer ni el Core");
    console.log("   Necesitas transferir ownership o usar la cuenta correcta");
  }

  console.log("\n✅ Verificación completada\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

