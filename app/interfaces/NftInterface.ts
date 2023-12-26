export interface NftSummary {
    id: number;
    issuer: string;  // Assuming issuer is a string
    bountyId: number;
    bountyIssuer: string;  // Assuming bountyIssuer is a string
    name: string;
    description: string;
    tokenId: number;
    createdAt: number;
    issuerMyBountyUrl: string;
    openSeaUrl: string;
}