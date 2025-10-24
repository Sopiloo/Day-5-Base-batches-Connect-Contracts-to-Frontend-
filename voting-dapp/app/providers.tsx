'use client';

import * as React from 'react';
import { WagmiProvider } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  RainbowKitProvider, 
  darkTheme,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';

// Replace with your WalletConnect project ID
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';

// Configure the default wallets
const config = getDefaultConfig({
  appName: 'Decentralized Voting App',
  projectId: projectId,
  chains: [baseSepolia],
  ssr: true,
});

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  
  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#4f46e5',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          {mounted && children}
          <Toaster position="top-right" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
