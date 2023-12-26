export interface Wallet {
    accounts: Array<{ address: string }>;
    provider: any;
    label: any;
}