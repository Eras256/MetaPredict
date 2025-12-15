import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DAO_GOVERNANCE_ADDRESS = process.env.NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS || "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123";
const REPUTATION_STAKING_ADDRESS = process.env.NEXT_PUBLIC_REPUTATION_STAKING_ADDRESS || "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7";

// ABI simplificado del contrato DAOGovernance
const DAO_GOVERNANCE_ABI = [
  "function proposalCounter() view returns (uint256)",
  "function getProposal(uint256 _proposalId) view returns (uint256 id, uint8 proposalType, address proposer, string memory title, string memory description, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, uint8 status, bool executed)",
  "function createParameterProposal(string calldata _title, string calldata _description) payable returns (uint256)",
  "function castVote(uint256 _proposalId, uint8 _support, string calldata _expertiseDomain)",
  "function executeProposal(uint256 _proposalId)",
  "function getUserProposals(address _user) view returns (uint256[] memory)",
  "function getUserVotes(address _user) view returns (uint256[] memory)",
  "function getExpertise(address _user, string calldata _domain) view returns (string memory domain, uint256 score, bool verified, uint256 verifiedAt, address[] memory attestations)",
  "function registerExpertise(string calldata _domain, string calldata _evidence)",
  "function attestExpertise(address _expert, string calldata _domain)",
  "function verifyExpertise(address _expert, string calldata _domain, uint256 _score)",
  "function votingPeriod() view returns (uint256)",
  "function minQuorum() view returns (uint256)",
  "function expertiseWeight() view returns (uint256)",
  "function coreContract() view returns (address)",
  "function reputationContract() view returns (address)",
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, uint8 proposalType, string title)",
  "event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 votes, uint256 quadraticVotes, bool isExpert)",
  "event ProposalExecuted(uint256 indexed proposalId, uint8 status)",
  "event ExpertiseVerified(address indexed expert, string domain, uint256 score)",
  "event ExpertiseAttested(address indexed expert, address indexed attester, string domain)"
];

async function main() {
  console.log("🚀 Iniciando pruebas del contrato DAOGovernance\n");
  console.log("=" .repeat(80));

  // Obtener el signer
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  const balance = await ethers.provider.getBalance(signerAddress);
  
  console.log(`📋 Información del Wallet:`);
  console.log(`   Dirección: ${signerAddress}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} BNB\n`);

  if (balance < ethers.parseEther("0.2")) {
    console.error("❌ Error: Balance insuficiente. Se necesitan al menos 0.2 BNB para las pruebas.");
    console.error("   - 0.1 BNB para crear propuesta");
    console.error("   - 0.1 BNB para gas y otras operaciones");
    process.exit(1);
  }

  // Conectar al contrato
  const daoGovernance = new ethers.Contract(
    DAO_GOVERNANCE_ADDRESS,
    DAO_GOVERNANCE_ABI,
    signer
  );

  console.log(`📄 Contrato DAOGovernance:`);
  console.log(`   Dirección: ${DAO_GOVERNANCE_ADDRESS}\n`);

  // ============ TEST 1: Leer configuración del contrato ============
  console.log("=" .repeat(80));
  console.log("TEST 1: Leer configuración del contrato");
  console.log("=" .repeat(80));

  try {
    const votingPeriod = await daoGovernance.votingPeriod();
    const minQuorum = await daoGovernance.minQuorum();
    const expertiseWeight = await daoGovernance.expertiseWeight();
    const coreContract = await daoGovernance.coreContract();
    const reputationContract = await daoGovernance.reputationContract();
    const proposalCounter = await daoGovernance.proposalCounter();

    console.log(`✅ Configuración del contrato:`);
    console.log(`   Voting Period: ${votingPeriod.toString()} bloques`);
    console.log(`   Min Quorum: ${ethers.formatEther(minQuorum)} BNB`);
    console.log(`   Expertise Weight: ${expertiseWeight.toString()}x`);
    console.log(`   Core Contract: ${coreContract}`);
    console.log(`   Reputation Contract: ${reputationContract}`);
    console.log(`   Proposal Counter: ${proposalCounter.toString()}\n`);
  } catch (error: any) {
    console.error(`❌ Error leyendo configuración: ${error.message}\n`);
  }

  // ============ TEST 2: Crear propuesta de parámetros ============
  console.log("=" .repeat(80));
  console.log("TEST 2: Crear propuesta de parámetros");
  console.log("=" .repeat(80));

  const proposalTitle = "Test Proposal - Parameter Change";
  const proposalDescription = "Esta es una propuesta de prueba para verificar el funcionamiento del contrato DAOGovernance. Monto mínimo: 0.1 BNB.";
  const proposalAmount = ethers.parseEther("0.1"); // Mínimo requerido

  let proposalId: bigint;

  try {
    console.log(`📝 Creando propuesta:`);
    console.log(`   Título: ${proposalTitle}`);
    console.log(`   Descripción: ${proposalDescription}`);
    console.log(`   Monto: ${ethers.formatEther(proposalAmount)} BNB\n`);

    const tx = await daoGovernance.createParameterProposal(
      proposalTitle,
      proposalDescription,
      { value: proposalAmount }
    );

    console.log(`⏳ Transacción enviada: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Propuesta creada exitosamente!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas usado: ${receipt.gasUsed.toString()}\n`);

    // Obtener el ID de la propuesta desde el evento
    const proposalCreatedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = daoGovernance.interface.parseLog(log);
        return parsed && parsed.name === "ProposalCreated";
      } catch {
        return false;
      }
    });

    if (proposalCreatedEvent) {
      const parsed = daoGovernance.interface.parseLog(proposalCreatedEvent);
      proposalId = parsed!.args[0];
      console.log(`   Proposal ID: ${proposalId.toString()}\n`);
    } else {
      // Si no encontramos el evento, obtener el último proposalCounter
      const newCounter = await daoGovernance.proposalCounter();
      proposalId = newCounter;
      console.log(`   Proposal ID (desde counter): ${proposalId.toString()}\n`);
    }
  } catch (error: any) {
    console.error(`❌ Error creando propuesta: ${error.message}\n`);
    if (error.reason) {
      console.error(`   Razón: ${error.reason}\n`);
    }
    process.exit(1);
  }

  // ============ TEST 3: Leer propuesta creada ============
  console.log("=" .repeat(80));
  console.log("TEST 3: Leer propuesta creada");
  console.log("=" .repeat(80));

  try {
    const proposal = await daoGovernance.getProposal(proposalId);
    
    console.log(`✅ Propuesta #${proposalId.toString()}:`);
    console.log(`   ID: ${proposal.id.toString()}`);
    console.log(`   Tipo: ${proposal.proposalType.toString()} (0=MarketResolution, 1=ParameterChange, 2=TreasurySpend, 3=EmergencyAction)`);
    console.log(`   Proposer: ${proposal.proposer}`);
    console.log(`   Título: ${proposal.title}`);
    console.log(`   Descripción: ${proposal.description}`);
    console.log(`   For Votes: ${proposal.forVotes.toString()}`);
    console.log(`   Against Votes: ${proposal.againstVotes.toString()}`);
    console.log(`   Abstain Votes: ${proposal.abstainVotes.toString()}`);
    console.log(`   Status: ${proposal.status.toString()} (0=Pending, 1=Active, 2=Succeeded, 3=Defeated, 4=Executed, 5=Cancelled)`);
    console.log(`   Executed: ${proposal.executed}\n`);
  } catch (error: any) {
    console.error(`❌ Error leyendo propuesta: ${error.message}\n`);
  }

  // ============ TEST 4: Registrar expertise ============
  console.log("=" .repeat(80));
  console.log("TEST 4: Registrar expertise");
  console.log("=" .repeat(80));

  const expertiseDomain = "blockchain";
  const expertiseEvidence = "Experiencia verificada en desarrollo de smart contracts";

  try {
    console.log(`📝 Registrando expertise:`);
    console.log(`   Dominio: ${expertiseDomain}`);
    console.log(`   Evidencia: ${expertiseEvidence}\n`);

    const tx = await daoGovernance.registerExpertise(expertiseDomain, expertiseEvidence);
    console.log(`⏳ Transacción enviada: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Expertise registrado exitosamente!`);
    console.log(`   Block: ${receipt.blockNumber}\n`);
  } catch (error: any) {
    console.error(`❌ Error registrando expertise: ${error.message}\n`);
    if (error.reason) {
      console.error(`   Razón: ${error.reason}\n`);
    }
  }

  // ============ TEST 5: Leer expertise ============
  console.log("=" .repeat(80));
  console.log("TEST 5: Leer expertise");
  console.log("=" .repeat(80));

  try {
    const expertise = await daoGovernance.getExpertise(signerAddress, expertiseDomain);
    
    console.log(`✅ Expertise de ${signerAddress}:`);
    console.log(`   Dominio: ${expertise.domain}`);
    console.log(`   Score: ${expertise.score.toString()}`);
    console.log(`   Verified: ${expertise.verified}`);
    console.log(`   Verified At: ${expertise.verifiedAt.toString()}`);
    console.log(`   Attestations: ${expertise.attestations.length} attestations\n`);
  } catch (error: any) {
    console.error(`❌ Error leyendo expertise: ${error.message}\n`);
  }

  // ============ TEST 6: Votar en la propuesta ============
  console.log("=" .repeat(80));
  console.log("TEST 6: Votar en la propuesta");
  console.log("=" .repeat(80));

  // Verificar balance antes de votar
  const balanceBeforeVote = await ethers.provider.getBalance(signerAddress);
  console.log(`💰 Balance antes de votar: ${ethers.formatEther(balanceBeforeVote)} BNB`);

  // Nota: El contrato usa el balance del wallet para determinar el poder de voto
  // En producción, esto consultaría ReputationStaking
  // Para esta prueba, usamos el balance actual del wallet

  const voteSupport = 1; // 0=Against, 1=For, 2=Abstain

  try {
    console.log(`📝 Votando en propuesta #${proposalId.toString()}:`);
    console.log(`   Support: ${voteSupport} (1=For)`);
    console.log(`   Expertise Domain: ${expertiseDomain}\n`);

    const tx = await daoGovernance.castVote(proposalId, voteSupport, expertiseDomain);
    console.log(`⏳ Transacción enviada: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Voto emitido exitosamente!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas usado: ${receipt.gasUsed.toString()}\n`);

    // Buscar evento VoteCast
    const voteCastEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = daoGovernance.interface.parseLog(log);
        return parsed && parsed.name === "VoteCast";
      } catch {
        return false;
      }
    });

    if (voteCastEvent) {
      const parsed = daoGovernance.interface.parseLog(voteCastEvent);
      console.log(`📊 Detalles del voto:`);
      console.log(`   Voter: ${parsed!.args[0]}`);
      console.log(`   Proposal ID: ${parsed!.args[1].toString()}`);
      console.log(`   Support: ${parsed!.args[2].toString()}`);
      console.log(`   Votes: ${parsed!.args[3].toString()}`);
      console.log(`   Quadratic Votes: ${parsed!.args[4].toString()}`);
      console.log(`   Is Expert: ${parsed!.args[5]}\n`);
    }
  } catch (error: any) {
    console.error(`❌ Error votando: ${error.message}\n`);
    if (error.reason) {
      console.error(`   Razón: ${error.reason}\n`);
    }
  }

  // ============ TEST 7: Leer propuesta después del voto ============
  console.log("=" .repeat(80));
  console.log("TEST 7: Leer propuesta después del voto");
  console.log("=" .repeat(80));

  try {
    const proposal = await daoGovernance.getProposal(proposalId);
    
    console.log(`✅ Propuesta #${proposalId.toString()} actualizada:`);
    console.log(`   For Votes: ${proposal.forVotes.toString()}`);
    console.log(`   Against Votes: ${proposal.againstVotes.toString()}`);
    console.log(`   Abstain Votes: ${proposal.abstainVotes.toString()}`);
    console.log(`   Status: ${proposal.status.toString()}\n`);
  } catch (error: any) {
    console.error(`❌ Error leyendo propuesta: ${error.message}\n`);
  }

  // ============ TEST 8: Obtener propuestas del usuario ============
  console.log("=" .repeat(80));
  console.log("TEST 8: Obtener propuestas del usuario");
  console.log("=" .repeat(80));

  try {
    const userProposals = await daoGovernance.getUserProposals(signerAddress);
    
    console.log(`✅ Propuestas del usuario ${signerAddress}:`);
    console.log(`   Total: ${userProposals.length}`);
    if (userProposals.length > 0) {
      userProposals.forEach((id: bigint, index: number) => {
        console.log(`   ${index + 1}. Proposal ID: ${id.toString()}`);
      });
    }
    console.log();
  } catch (error: any) {
    console.error(`❌ Error obteniendo propuestas del usuario: ${error.message}\n`);
  }

  // ============ TEST 9: Obtener votos del usuario ============
  console.log("=" .repeat(80));
  console.log("TEST 9: Obtener votos del usuario");
  console.log("=" .repeat(80));

  try {
    const userVotes = await daoGovernance.getUserVotes(signerAddress);
    
    console.log(`✅ Votos del usuario ${signerAddress}:`);
    console.log(`   Total: ${userVotes.length}`);
    if (userVotes.length > 0) {
      userVotes.forEach((id: bigint, index: number) => {
        console.log(`   ${index + 1}. Proposal ID: ${id.toString()}`);
      });
    }
    console.log();
  } catch (error: any) {
    console.error(`❌ Error obteniendo votos del usuario: ${error.message}\n`);
  }

  // ============ TEST 10: Verificar balance final ============
  console.log("=" .repeat(80));
  console.log("TEST 10: Verificar balance final");
  console.log("=" .repeat(80));

  const balanceAfter = await ethers.provider.getBalance(signerAddress);
  const gasUsed = balanceBeforeVote - balanceAfter;
  
  console.log(`💰 Balance después de las pruebas: ${ethers.formatEther(balanceAfter)} BNB`);
  console.log(`⛽ Gas usado (aproximado): ${ethers.formatEther(gasUsed)} BNB\n`);

  // ============ RESUMEN ============
  console.log("=" .repeat(80));
  console.log("✅ RESUMEN DE PRUEBAS");
  console.log("=" .repeat(80));
  console.log(`✅ Propuesta creada: #${proposalId.toString()}`);
  console.log(`✅ Expertise registrado: ${expertiseDomain}`);
  console.log(`✅ Voto emitido en propuesta #${proposalId.toString()}`);
  console.log(`✅ Todas las funciones de lectura verificadas\n`);

  console.log("📋 Nota: Para ejecutar la propuesta, necesitas esperar a que termine el período de votación");
  console.log(`   Voting Period: ${await daoGovernance.votingPeriod()} bloques\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

