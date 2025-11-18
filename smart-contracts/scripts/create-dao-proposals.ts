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
  console.log("🗳️  Creando 3 propuestas DAO para votación...\n");

  const DAO_GOVERNANCE = "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123";
  
  // Obtener signer desde private key o usar el primer signer de hardhat
  let signer;
  if (process.env.PRIVATE_KEY) {
    const provider = new ethers.JsonRpcProvider("https://opbnb-testnet-rpc.bnbchain.org");
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("📝 Usando cuenta desde PRIVATE_KEY:", signer.address);
  } else {
    const signers = await ethers.getSigners();
    signer = signers[0];
    console.log("📝 Usando primer signer de Hardhat:", signer.address);
  }

  const balance = await signer.provider.getBalance(signer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

  // Necesitamos al menos 0.3 BNB (0.1 por propuesta)
  const minRequired = ethers.parseEther("0.3");
  if (balance < minRequired) {
    console.error("❌ Error: Balance insuficiente!");
    console.error(`   Necesitas al menos ${ethers.formatEther(minRequired)} BNB`);
    console.error(`   Tienes: ${ethers.formatEther(balance)} BNB`);
    process.exit(1);
  }

  // Conectar al contrato DAOGovernance
  const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
  const dao = DAOGovernance.attach(DAO_GOVERNANCE);

  // Definir las 3 propuestas
  const proposals = [
    {
      title: "Aumentar el período de votación a 7 días",
      description: "Esta propuesta busca extender el período de votación de 3 días a 7 días para dar más tiempo a los miembros de la comunidad para revisar y votar en las propuestas importantes. Esto permitirá una participación más inclusiva y decisiones más informadas."
    },
    {
      title: "Reducir el quórum mínimo de 1 BNB a 0.5 BNB",
      description: "Esta propuesta busca reducir el quórum mínimo requerido para aprobar propuestas de 1 BNB a 0.5 BNB. Esto facilitará la aprobación de propuestas y aumentará la participación en la gobernanza, especialmente para propuestas de menor escala."
    },
    {
      title: "Implementar sistema de recompensas para votantes activos",
      description: "Esta propuesta busca implementar un sistema de recompensas para los miembros que participan activamente en la gobernanza. Los votantes que participen regularmente recibirán tokens de reputación adicionales como incentivo por su compromiso con la comunidad."
    }
  ];

  const proposalAmount = ethers.parseEther("0.1"); // 0.1 BNB por propuesta

  console.log("📋 Propuestas a crear:");
  proposals.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.title}`);
  });
  console.log("");

  // Crear cada propuesta
  for (let i = 0; i < proposals.length; i++) {
    const proposal = proposals[i];
    console.log(`📝 Creando propuesta ${i + 1}/${proposals.length}: "${proposal.title}"`);
    
    try {
      // Estimar gas primero
      const gasEstimate = await dao.createParameterProposal.estimateGas(
        proposal.title,
        proposal.description,
        { value: proposalAmount }
      );
      console.log(`   Gas estimado: ${gasEstimate.toString()}`);

      // Crear la propuesta
      const tx = await dao.createParameterProposal(
        proposal.title,
        proposal.description,
        { value: proposalAmount }
      );
      
      console.log(`   ✅ Transacción enviada: ${tx.hash}`);
      console.log(`   ⏳ Esperando confirmación...`);
      
      const receipt = await tx.wait();
      console.log(`   ✅ Propuesta ${i + 1} creada exitosamente!`);
      console.log(`   Block: ${receipt.blockNumber}`);
      
      // Buscar el evento ProposalCreated para obtener el ID
      const proposalCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = dao.interface.parseLog(log);
          return parsed && parsed.name === 'ProposalCreated';
        } catch {
          return false;
        }
      });

      if (proposalCreatedEvent) {
        const parsed = dao.interface.parseLog(proposalCreatedEvent);
        const proposalId = parsed?.args[0];
        console.log(`   🆔 ID de propuesta: ${proposalId.toString()}`);
      }

      console.log("");
      
      // Esperar un poco entre transacciones para evitar problemas de nonce
      if (i < proposals.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      console.error(`   ❌ Error creando propuesta ${i + 1}:`, error.message);
      if (error.reason) {
        console.error(`   Razón: ${error.reason}`);
      }
      if (error.data) {
        console.error(`   Data: ${error.data}`);
      }
      console.log("");
    }
  }

  console.log("🎉 Proceso completado!");
  console.log("\n📊 Resumen:");
  console.log(`   - Propuestas creadas: ${proposals.length}`);
  console.log(`   - Contrato DAO: ${DAO_GOVERNANCE}`);
  console.log(`   - Puedes ver las propuestas en: https://testnet.opbnbscan.com/address/${DAO_GOVERNANCE}#readContract`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

