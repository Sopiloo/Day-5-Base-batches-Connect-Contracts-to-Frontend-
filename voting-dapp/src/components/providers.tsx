'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { Toaster } from 'react-hot-toast';

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
    
    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

    // Required App Info
    appName: 'DecentraVote',
    
    // Optional App Info
    appDescription: 'Une application de vote décentralisée',
    appUrl: 'https://decentravote.vercel.app',
    appIcon: 'https://decentravote.vercel.app/logo.png',
  })
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          mode="dark"
          customTheme={{
            '--ck-connectbutton-background': '#4f46e5',
            '--ck-connectbutton-hover-background': '#4338ca',
          }}
        >
          <Toaster position="top-right" />
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
