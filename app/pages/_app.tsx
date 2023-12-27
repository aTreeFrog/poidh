import React, { useEffect } from 'react';
import Navigation from '../components/Navigation'; // Adjust path as necessary
import Footer from '../components/Footer'; // Adjust path as necessary
import { useContract } from '../web3/index'; // Adjust path as necessary
import '../styles/globals.css'; // Import your global styles
import type { AppProps } from 'next/app';
import { ContractProvider } from '../context/ContractContext';

function App({ Component, pageProps }: AppProps) {
    const {
        wallet,
        fetchUserClaims,
        fetchUserBalance
    } = useContract();

    useEffect(() => {
        if (wallet?.provider) {
            fetchUserClaims();
            fetchUserBalance();
        }
    }, [wallet]);

    return (
        <div className="site-container">
            <div className="content-wrap">
                <Navigation wallet={wallet} />
                <ContractProvider>
                    <Component {...pageProps} />
                </ContractProvider>
            </div>
            <Footer />
        </div>
    );
}

export default App;
