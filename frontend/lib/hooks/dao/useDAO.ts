'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSendTransaction, useActiveAccount, useReadContract } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { waitForReceipt } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { client } from '@/lib/config/thirdweb';
import { toast } from 'sonner';
import { getTransactionUrl, formatTxHash } from '@/lib/utils/blockchain';

// ProposalStatus enum values from contract
const ProposalStatus = {
  Pending: 0,
  Active: 1,
  Succeeded: 2,
  Defeated: 3,
  Executed: 4,
  Cancelled: 5,
} as const;

const ProposalStatusLabels: Record<number, string> = {
  0: 'Pending',
  1: 'Active',
  2: 'Succeeded',
  3: 'Defeated',
  4: 'Executed',
  5: 'Cancelled',
};

const opBNBTestnet = defineChain({
  id: 5611,
  name: 'opBNB Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpc: 'https://opbnb-testnet-rpc.bnbchain.org',
});

// ProposalType enum values
const ProposalTypeLabels: Record<number, string> = {
  0: 'MarketResolution',
  1: 'ParameterChange',
  2: 'TreasurySpend',
  3: 'EmergencyAction',
};

// ABI simplificado - debería importarse del archivo ABI real
const DAOGovernanceABI = [
  {
    name: 'proposalCounter',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getProposal',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_proposalId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'proposalType', type: 'uint8' },
      { name: 'proposer', type: 'address' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'forVotes', type: 'uint256' },
      { name: 'againstVotes', type: 'uint256' },
      { name: 'abstainVotes', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'executed', type: 'bool' },
    ],
  },
  {
    name: 'castVote',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_proposalId', type: 'uint256' },
      { name: '_support', type: 'uint8' },
      { name: '_expertiseDomain', type: 'string' },
    ],
  },
  {
    name: 'executeProposal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_proposalId', type: 'uint256' }],
  },
  {
    name: 'getUserProposals',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getUserVotes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getExpertise',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_domain', type: 'string' },
    ],
    outputs: [
      { name: 'domain', type: 'string' },
      { name: 'score', type: 'uint256' },
      { name: 'verified', type: 'bool' },
      { name: 'verifiedAt', type: 'uint256' },
      { name: 'attestations', type: 'address[]' },
    ],
  },
] as const;

export function useProposal(proposalId: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    try {
      // Validar que la dirección tenga el formato correcto
      const addr = CONTRACT_ADDRESSES.DAO_GOVERNANCE;
      if (!addr || addr.length !== 42 || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
        console.warn('Invalid DAO_GOVERNANCE address:', addr);
        return null;
      }
      return getContract({
        client,
        chain: opBNBTestnet,
        address: addr,
        abi: DAOGovernanceABI as any,
      });
    } catch (error) {
      console.error('Error creating DAO contract:', error);
      return null;
    }
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getProposal',
    params: [BigInt(proposalId)],
    queryOptions: { enabled: proposalId > 0 && !!contract },
  });

  const result = data as any;

  return {
    proposal: result
      ? {
          id: Number(result[0]),
          proposalType: Number(result[1]),
          proposer: result[2],
          title: result[3],
          description: result[4],
          forVotes: Number(result[5]),
          againstVotes: Number(result[6]),
          abstainVotes: Number(result[7]),
          status: Number(result[8]),
          executed: result[9],
        }
      : null,
    isLoading,
  };
}

export function useVoteOnProposal() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DAO_GOVERNANCE,
      abi: DAOGovernanceABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const vote = async (proposalId: number, support: 0 | 1 | 2, expertiseDomain: string = '') => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('DAO Governance contract not configured');
    }
    
    try {
      setLoading(true);
      
      // Verificar el estado real de la propuesta antes de votar
      try {
        const proposalData = await readContract({
          contract,
          method: 'getProposal',
          params: [BigInt(proposalId)],
        }) as any;

        // Verificar que la propuesta existe (el ID debe ser mayor a 0)
        const proposalIdFromContract = Number(proposalData[0]);
        if (!proposalIdFromContract || proposalIdFromContract === 0 || proposalIdFromContract !== proposalId) {
          throw new Error(`Proposal #${proposalId} does not exist in the contract`);
        }

        const proposalStatus = Number(proposalData[8]);
        
        // Verificar que la propuesta esté en estado Active (1)
        if (proposalStatus !== ProposalStatus.Active) {
          const statusLabel = ProposalStatusLabels[proposalStatus] || 'Unknown';
          throw new Error(`Proposal #${proposalId} is not active. Current status: ${statusLabel}. You can only vote on proposals with Active status.`);
        }

        // Verificar que no haya sido ejecutada
        if (proposalData[9] === true) {
          throw new Error('This proposal has already been executed');
        }
      } catch (validationError: any) {
        // Si es un error de validación personalizado, mostrarlo y no continuar
        if (validationError.message && 
            (validationError.message.includes('does not exist') || 
             validationError.message.includes('is not active') || 
             validationError.message.includes('already been executed'))) {
          toast.error(validationError.message);
          throw validationError;
        }
        // Si es un error de contrato (revert, etc.), continuar para que el contrato lo maneje
        // El contrato también validará el estado y mostrará su propio error
      }
      
      const tx = prepareContractCall({
        contract,
        method: 'castVote',
        params: [BigInt(proposalId), support, expertiseDomain],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      
      // Disparar evento personalizado para refrescar propuestas
      // Esperar un poco para que el bloque se confirme antes de refrescar
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('proposal-voted', { detail: { proposalId } }));
      }, 3000);
      
      toast.success(
        `Vote cast successfully! View transaction: ${formatTxHash(txHash)}`,
        {
          duration: 10000,
          action: {
            label: 'View on opBNBScan',
            onClick: () => window.open(txUrl, '_blank'),
          },
        }
      );
      
      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('Error voting:', error);
      
      // Mejorar mensajes de error
      let errorMessage = error?.message || 'Error casting vote';
      
      if (errorMessage.includes('Not active')) {
        errorMessage = 'Proposal is not active. You can only vote on proposals with Active status.';
      } else if (errorMessage.includes('Voting ended')) {
        errorMessage = 'Voting period has ended for this proposal.';
      } else if (errorMessage.includes('Already voted')) {
        errorMessage = 'You have already voted on this proposal.';
      } else if (errorMessage.includes('No voting power')) {
        errorMessage = 'You do not have sufficient voting power. You need to have BNB in the contract.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { vote, isPending: loading || isSending };
}

export function useExecuteProposal() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DAO_GOVERNANCE,
      abi: DAOGovernanceABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const execute = async (proposalId: number) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('DAO Governance contract not configured');
    }
    
    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'executeProposal',
        params: [BigInt(proposalId)],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Proposal executed successfully! View transaction: ${formatTxHash(txHash)}`,
        {
          duration: 10000,
          action: {
            label: 'View on opBNBScan',
            onClick: () => window.open(txUrl, '_blank'),
          },
        }
      );
      
      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('Error executing proposal:', error);
      toast.error(error?.message || 'Error executing proposal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { execute, isPending: loading || isSending };
}

export function useUserProposals() {
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DAO_GOVERNANCE,
      abi: DAOGovernanceABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getUserProposals',
    params: account?.address ? [account.address] : undefined,
    queryOptions: { enabled: !!account && !!contract },
  });

  return {
    proposalIds: (data as any) || [],
    isLoading,
  };
}

export function useExpertise(userAddress: string, domain: string) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DAO_GOVERNANCE,
      abi: DAOGovernanceABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getExpertise',
    params: [userAddress as `0x${string}`, domain],
    queryOptions: { enabled: !!userAddress && !!domain && !!contract },
  });

  const result = data as any;

  return {
    expertise: result
      ? {
          domain: result[0],
          score: Number(result[1]),
          verified: result[2],
          verifiedAt: Number(result[3]),
          attestations: result[4] || [],
        }
      : null,
    isLoading,
  };
}

export function useAllProposals() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProposals, setTotalProposals] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DAO_GOVERNANCE,
      abi: DAOGovernanceABI as any,
    });
  }, []);

  // Obtener el contador de propuestas
  const { data: proposalCounter, isLoading: counterLoading, refetch: refetchCounter } = useReadContract({
    contract: contract!,
    method: 'proposalCounter',
    queryOptions: { enabled: !!contract },
  });

  // Función para refrescar las propuestas
  const refetch = async () => {
    setRefreshKey(prev => prev + 1);
    await refetchCounter?.();
  };

  useEffect(() => {
    if (!contract) {
      setIsLoading(counterLoading);
      return;
    }

    // Obtener el contador actualizado si no está disponible
    const fetchProposals = async () => {
      try {
        let total = totalProposals;
        
        // Si no tenemos proposalCounter, obtenerlo
        if (!proposalCounter) {
          const counter = await readContract({
            contract,
            method: 'proposalCounter',
          }) as any;
          total = Number(counter);
        } else {
          total = Number(proposalCounter);
        }

        setTotalProposals(total);

        if (total === 0) {
          setProposals([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        // Obtener todas las propuestas en paralelo
        const proposalIds = Array.from({ length: total }, (_, i) => i + 1);
        
        const proposalPromises = proposalIds.map(async (id) => {
          try {
            const data = await readContract({
              contract,
              method: 'getProposal',
              params: [BigInt(id)],
            }) as any;

            const proposalId = Number(data[0]);
            
            // Si el ID es 0, la propuesta no existe
            if (proposalId === 0) return null;

            const proposal = {
              id: proposalId,
              proposalType: Number(data[1]),
              proposer: data[2],
              title: data[3] || '',
              description: data[4] || '',
              forVotes: Number(data[5]),
              againstVotes: Number(data[6]),
              abstainVotes: Number(data[7]),
              status: Number(data[8]),
              executed: data[9],
              type: ProposalTypeLabels[Number(data[1])] || 'Unknown',
              statusLabel: ProposalStatusLabels[Number(data[8])] || 'Unknown',
            };

            // Debug: Log para verificar que los votos se están leyendo correctamente
            if (proposalId <= 3) {
              console.log(`Proposal ${proposalId} votes:`, {
                forVotes: proposal.forVotes,
                againstVotes: proposal.againstVotes,
                abstainVotes: proposal.abstainVotes,
                raw: data
              });
            }

            return proposal;
          } catch (error) {
            console.error(`Error fetching proposal ${id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(proposalPromises);
        const validProposals = results
          .filter((p): p is NonNullable<typeof p> => p !== null)
          .reverse(); // Mostrar las más recientes primero

        setProposals(validProposals);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        setProposals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [contract, proposalCounter, counterLoading, refreshKey]);

  return {
    proposals,
    isLoading: isLoading || counterLoading,
    totalProposals,
    refetch,
  };
}
