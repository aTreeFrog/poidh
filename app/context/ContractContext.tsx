import React, { createContext, useContext, ReactNode } from 'react';
import { useContract } from '../web3/index';
import { Wallet } from '../interfaces/WalletInterface';
import { Bounty } from '../interfaces/BountiesInterface';
import { Claim } from '../interfaces/ClaimsInterface';
import { Summary } from '../interfaces/SummaryInterface';
import { NftSummary } from '../interfaces/NftInterface';

interface ContractContextProps {
    wallet: any;
    connect: any;
    disconnect: any;
    connecting: any;
    userBalance: string;
    userBounties: Bounty[];
    unClaimedBounties: Bounty[];
    claimedBounties: Bounty[];
    userSummary: any;
    userNftCards: NftSummary[];
    fetchUserBalance: () => Promise<void>;
    getClaimsByBountyId: (bountyId: number) => Promise<Claim[]>;
    getTokenUri: (tokenId: number) => Promise<string | null>;
    fetchBountyDetails: (id: number) => Promise<Bounty | null>;
    acceptClaim: (bountyId: number, claimId: number) => Promise<void>;
    cancelBounty: (bountyId: number) => Promise<void>;
    fetchUserClaims: () => Promise<void>;
    fetchAllBounties: () => Promise<void>;
    getContract: () => Promise<any>;
    fetchUserSummary: (userAddress: string) => Promise<void>;
    createNftCards: (userAddress: string) => Promise<void>;
}

const ContractContext = createContext<ContractContextProps | undefined>(undefined);

export const ContractProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
    const contractData = useContract();

    return (
        <ContractContext.Provider value={contractData}>
            {children}
        </ContractContext.Provider>
    );
};

export const useContractData = () => {
    const context = useContext(ContractContext);
    if (context === undefined) {
        throw new Error('useContractData must be used within a ContractProvider');
    }
    return context;
};
