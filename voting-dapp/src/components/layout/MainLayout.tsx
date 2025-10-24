'use client';

import { ReactNode } from 'react';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { useAccount, useChainId } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const pathname = usePathname();

  // Check if we're on the correct network
  const isWrongNetwork = chainId !== baseSepolia.id;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Head>
        <title>DecentraVote - Application de vote décentralisée</title>
        <meta name="description" content="Une application de vote décentralisée sécurisée sur le réseau Base" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {isWrongNetwork ? (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-4 rounded-lg mb-6">
            <p className="font-bold">Réseau incorrect</p>
            <p>Veuillez vous connecter au réseau Base Sepolia pour utiliser cette application.</p>
          </div>
        ) : null}
        
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      <Footer />
      
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(var(--popover))',
            color: 'hsl(var(--popover-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
};

export default MainLayout;
